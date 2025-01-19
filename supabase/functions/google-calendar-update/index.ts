import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventId, startTime, endTime, date, user_id } = await req.json();
    
    console.log('Received request:', { eventId, startTime, endTime, date, user_id });
    
    if (!eventId || !startTime || !endTime || !date || !user_id) {
      console.error('Missing required parameters:', { eventId, startTime, endTime, date, user_id });
      throw new Error('Missing required parameters');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: tokenData, error: tokenError } = await supabase
      .from('calendar_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', user_id)
      .maybeSingle();

    if (tokenError || !tokenData?.access_token) {
      console.error('Token error:', tokenError);
      throw new Error('No valid token found');
    }

    // Parse the base date
    const baseDate = new Date(date);
    if (isNaN(baseDate.getTime())) {
      throw new Error('Invalid date format provided');
    }

    // Get hours and minutes from the time strings
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    // Create the full ISO date-time strings
    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const day = String(baseDate.getDate()).padStart(2, '0');
    
    const startDateTime = `${year}-${month}-${day}T${String(startHours).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}:00`;
    const endDateTime = `${year}-${month}-${day}T${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00`;

    // Get user's timezone
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('Using timezone:', userTimeZone);
    console.log('Formatted dates:', { startDateTime, endDateTime });

    // Validate times
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);
    if (startDate >= endDate) {
      return new Response(
        JSON.stringify({
          error: 'Invalid time range: start time must be before end time'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Check if token is expired and refresh if needed
    const now = new Date();
    const tokenExpiry = tokenData.expires_at ? new Date(tokenData.expires_at) : null;
    let accessToken = tokenData.access_token;

    if (tokenExpiry && tokenExpiry <= now && tokenData.refresh_token) {
      console.log('Token expired, refreshing...');
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
      accessToken = refreshData.access_token;
      
      await supabase
        .from('calendar_tokens')
        .update({ 
          access_token: refreshData.access_token,
          expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString()
        })
        .eq('user_id', user_id);
    }

    // Add exponential backoff for rate limiting
    const maxRetries = 3;
    let retryCount = 0;
    let lastError = null;

    while (retryCount < maxRetries) {
      try {
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              start: { 
                dateTime: startDateTime,
                timeZone: userTimeZone
              },
              end: { 
                dateTime: endDateTime,
                timeZone: userTimeZone
              },
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

          if (response.status === 403 && responseData.error?.errors?.[0]?.reason === 'rateLimitExceeded') {
            lastError = new Error('Rate limit exceeded');
            const backoffTime = Math.pow(2, retryCount) * 1000;
            console.log(`Rate limit exceeded. Retrying in ${backoffTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
            retryCount++;
            continue;
          }

          throw new Error(`Failed to update calendar event: ${response.status} ${response.statusText}`);
        }

        console.log('Successfully updated event:', responseData);

        return new Response(
          JSON.stringify({ success: true, event: responseData }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      } catch (error) {
        lastError = error;
        if (retryCount < maxRetries - 1) {
          const backoffTime = Math.pow(2, retryCount) * 1000;
          console.log(`Error occurred. Retrying in ${backoffTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
          retryCount++;
        } else {
          break;
        }
      }
    }

    throw lastError || new Error('Failed to update calendar event after all retries');

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