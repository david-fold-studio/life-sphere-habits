import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { eventId, startTime, endTime, date, user_id, timeZone } = await req.json()
    
    console.log('Received request:', { eventId, startTime, endTime, date, user_id, timeZone })

    // Extract the date part from the provided date
    const datePart = date.split('T')[0]
    
    // Format the datetime strings
    const startDateTime = `${datePart}T${startTime}:00`
    const endDateTime = `${datePart}T${endTime}:00`

    console.log('Formatted dates:', {
      startDateTime,
      endDateTime,
      timeZone,
      originalTimes: { startTime, endTime },
      originalDate: date
    })

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    console.log('Fetching token for user:', user_id)
    
    // Get the user's calendar token using the user_id parameter
    const response = await fetch(
      `${supabaseUrl}/rest/v1/calendar_tokens?select=access_token&user_id=eq.${user_id}`,
      {
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          apikey: supabaseServiceKey,
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch token:', await response.text());
      throw new Error('Failed to fetch token');
    }

    const tokenData = await response.json();
    console.log('Token data response:', tokenData);

    if (!tokenData || !tokenData[0] || !tokenData[0].access_token) {
      console.error('No token found for user:', user_id);
      throw new Error('No valid token found');
    }

    const accessToken = tokenData[0].access_token;
    console.log('Successfully retrieved access token');

    const googleResponse = await fetch(
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
            timeZone
          },
          end: {
            dateTime: endDateTime,
            timeZone
          },
        }),
      }
    )

    if (!googleResponse.ok) {
      const errorText = await googleResponse.text()
      console.error('Google Calendar API error:', {
        status: googleResponse.status,
        statusText: googleResponse.statusText,
        error: errorText
      })
      throw new Error(`Failed to update calendar event: ${googleResponse.status} ${googleResponse.statusText} - ${errorText}`)
    }

    const responseData = await googleResponse.json()
    console.log('Successfully updated event:', responseData)

    return new Response(
      JSON.stringify({ success: true, event: responseData }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in google-calendar-update:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})