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
    const { eventId, startTime, endTime, date, timeZone } = await req.json()
    
    console.log('Received request:', { eventId, startTime, endTime, date, timeZone })

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
    
    // Get the user's calendar token
    const { data: tokenData, error: tokenError } = await fetch(
      `${supabaseUrl}/rest/v1/calendar_tokens?user_id=eq.${req.headers.get('x-user-id')}`,
      {
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          apikey: supabaseServiceKey,
        },
      }
    ).then(res => res.json())

    if (tokenError || !tokenData?.[0]?.access_token) {
      throw new Error('No valid token found')
    }

    const accessToken = tokenData[0].access_token

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
            timeZone
          },
          end: {
            dateTime: endDateTime,
            timeZone
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Calendar API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      throw new Error(`Failed to update calendar event: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const responseData = await response.json()
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