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

    // Parse the date from the interface
    const [year, month, day] = date.split('T')[0].split('-').map(Number)
    
    // Create date objects for start and end times using the interface date
    const startDateTime = new Date(Date.UTC(year, month - 1, day))
    const endDateTime = new Date(Date.UTC(year, month - 1, day))
    
    // Set the hours and minutes from the interface times
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)
    
    startDateTime.setUTCHours(startHour, startMinute, 0)
    endDateTime.setUTCHours(endHour, endMinute, 0)

    // Format dates in RFC3339 format
    const startDateTimeString = startDateTime.toISOString()
    const endDateTimeString = endDateTime.toISOString()

    console.log('Formatted dates for Google Calendar:', {
      startDateTime: startDateTimeString,
      endDateTime: endDateTimeString,
      timeZone,
      originalTimes: { startTime, endTime },
      originalDate: date,
      parsedComponents: { year, month, day, startHour, startMinute, endHour, endMinute },
      eventId
    })

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    console.log('Fetching token for user:', user_id)
    
    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${user_id}&select=id`,
      {
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          apikey: supabaseServiceKey,
        },
      }
    )

    if (!profileResponse.ok) {
      console.error('Failed to fetch profile:', await profileResponse.text())
      throw new Error('Failed to fetch profile')
    }

    const profileData = await profileResponse.json()
    console.log('Profile data:', profileData)

    if (!profileData || profileData.length === 0) {
      throw new Error('Profile not found')
    }

    const profileId = profileData[0].id
    
    const tokenResponse = await fetch(
      `${supabaseUrl}/rest/v1/calendar_tokens?select=access_token&user_id=eq.${profileId}`,
      {
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          apikey: supabaseServiceKey,
        },
      }
    )

    if (!tokenResponse.ok) {
      console.error('Failed to fetch token:', await tokenResponse.text())
      throw new Error('Failed to fetch token')
    }

    const tokenData = await tokenResponse.json()
    console.log('Token data response:', tokenData)

    if (!tokenData || !tokenData[0] || !tokenData[0].access_token) {
      console.error('No token found for profile:', profileId)
      throw new Error('No valid token found')
    }

    const accessToken = tokenData[0].access_token
    console.log('Successfully retrieved access token')

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
            dateTime: startDateTimeString,
            timeZone
          },
          end: {
            dateTime: endDateTimeString,
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
        error: errorText,
        requestBody: {
          start: { dateTime: startDateTimeString, timeZone },
          end: { dateTime: endDateTimeString, timeZone }
        }
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