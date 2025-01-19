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
    const { eventId, startTime, endTime, date, user_id, timeZone } = await req.json();
    
    console.log('Received request:', { eventId, startTime, endTime, date, user_id, timeZone });
    
    if (!eventId || !startTime || !endTime || !date || !user_id || !timeZone) {
      console.error('Missing required parameters:', { eventId, startTime, endTime, date, user_id, timeZone });
      throw new Error('Missing required parameters');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user's calendar token
    const { data: tokenData, error: tokenError } = await supabase
      .from('calendar_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', user_id)
      .maybeSingle();

    if (tokenError || !tokenData?.access_token) {
      console.error('Token error:', tokenError);
      throw new Error('No valid token found');
    }

    // Format the date-time strings by combining the date part with the time
    const datePart = date.split('T')[0];
    const startDateTime = `${datePart}T${startTime}:00`;
    const endDateTime = `${datePart}T${endTime}:00`;

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
        const endpoint = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;
        console.log('Making request to endpoint:', endpoint);
        
        const response = await fetch(
          endpoint,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              start: { 
                dateTime: startDateTime,
                timeZone
              },
              end: { 
                dateTime: endDateTime,
                timeZone
              },
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Google Calendar API error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });

          if (response.status === 403 && errorText.includes('rateLimitExceeded')) {
            lastError = new Error('Rate limit exceeded');
            const backoffTime = Math.pow(2, retryCount) * 1000;
            console.log(`Rate limit exceeded. Retrying in ${backoffTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
            retryCount++;
            continue;
          }

          throw new Error(`Failed to update calendar event: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const responseData = await response.json();
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