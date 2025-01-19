import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { eventId, startTime, endTime, date, user_id } = await req.json();
    
    console.log('Received request:', { eventId, startTime, endTime, date, user_id });
    
    if (!eventId || !startTime || !endTime || !date || !user_id) {
      console.error('Missing required parameters:', { eventId, startTime, endTime, date, user_id });
      throw new Error('Missing required parameters');
    }

    // Get the user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: tokenData, error: tokenError } = await supabase
      .from('calendar_tokens')
      .select('access_token, refresh_token')
      .eq('user_id', user_id)
      .maybeSingle();

    if (tokenError || !tokenData?.access_token) {
      console.error('Token error:', tokenError);
      throw new Error('No valid token found');
    }

    // Parse the date string and time strings
    const baseDate = new Date(date);
    if (isNaN(baseDate.getTime())) {
      throw new Error('Invalid date format provided');
    }

    // Convert time strings to Date objects
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startDate = new Date(baseDate);
    const endDate = new Date(baseDate);
    
    startDate.setHours(startHours, startMinutes, 0);
    endDate.setHours(endHours, endMinutes, 0);

    console.log('Updating event with dates:', {
      eventId,
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString()
    });

    // Update the event in Google Calendar
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start: { dateTime: startDate.toISOString() },
          end: { dateTime: endDate.toISOString() },
        }),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Google Calendar API error:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData
      });

      // If token is expired, try to refresh it
      if (response.status === 401 && tokenData.refresh_token) {
        console.log('Token expired, attempting refresh...');
        const refreshResponse = await fetch(
          'https://oauth2.googleapis.com/token',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: Deno.env.get('GOOGLE_OAUTH_CLIENT_ID')!,
              client_secret: Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET')!,
              refresh_token: tokenData.refresh_token,
              grant_type: 'refresh_token',
            }),
          }
        );

        if (!refreshResponse.ok) {
          throw new Error('Failed to refresh token');
        }

        const refreshData = await refreshResponse.json();
        
        // Update token in database
        await supabase
          .from('calendar_tokens')
          .update({ 
            access_token: refreshData.access_token,
            expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString()
          })
          .eq('user_id', user_id);

        // Retry the original request with new token
        const retryResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${refreshData.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              start: { dateTime: startDate.toISOString() },
              end: { dateTime: endDate.toISOString() },
            }),
          }
        );

        if (!retryResponse.ok) {
          throw new Error(`Failed to update calendar event after token refresh: ${retryResponse.status} ${retryResponse.statusText}`);
        }

        const retryData = await retryResponse.json();
        return new Response(
          JSON.stringify({ success: true, event: retryData }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      throw new Error(`Failed to update calendar event: ${response.status} ${response.statusText}`);
    }

    console.log('Successfully updated event:', {
      id: responseData.id,
      summary: responseData.summary,
      start: responseData.start,
      end: responseData.end
    });

    return new Response(
      JSON.stringify({ success: true, event: responseData }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in google-calendar-update:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});