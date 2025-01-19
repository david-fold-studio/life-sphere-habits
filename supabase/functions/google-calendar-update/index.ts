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
    const { eventId, startTime, endTime, date, user_id, timeZone, newDay } = await req.json()
    
    console.log('Received request:', { eventId, startTime, endTime, date, user_id, timeZone, newDay })

    // Check if this is a recurring event
    const isRecurring = eventId.includes('_R')

    // For recurring events, we need to use the original event date
    let eventDate = date
    if (isRecurring) {
      // Extract the date from the recurring event ID (format: originalEventId_R20250107T233000)
      const dateFromId = eventId.split('_R')[1]
      if (dateFromId) {
        const year = dateFromId.substring(0, 4)
        const month = dateFromId.substring(4, 6)
        const day = dateFromId.substring(6, 8)
        eventDate = `${year}-${month}-${day}T00:00:00Z`
      }
    }

    // Parse the event date and adjust for the new day if provided
    const eventDateTime = new Date(eventDate)
    if (typeof newDay === 'number') {
      // Calculate the difference in days
      const currentDay = eventDateTime.getDay()
      const dayDiff = newDay - currentDay
      eventDateTime.setDate(eventDateTime.getDate() + dayDiff)
    }

    const year = eventDateTime.getUTCFullYear()
    const month = String(eventDateTime.getUTCMonth() + 1).padStart(2, '0')
    const day = String(eventDateTime.getUTCDate()).padStart(2, '0')

    // Format times with proper padding
    const [startHour, startMinute] = startTime.split(':').map(n => String(n).padStart(2, '0'))
    const [endHour, endMinute] = endTime.split(':').map(n => String(n).padStart(2, '0'))

    // Format the datetime strings in RFC3339 format
    const formattedTimeZone = timeZone.includes('+') || timeZone.includes('-') ? timeZone : ''
    const startDateTime = `${year}-${month}-${day}T${startHour}:${startMinute}:00${formattedTimeZone}`
    const endDateTime = `${year}-${month}-${day}T${endHour}:${endMinute}:00${formattedTimeZone}`

    console.log('Formatted dates for Google Calendar:', {
      startDateTime,
      endDateTime,
      timeZone,
      originalTimes: { startTime, endTime },
      originalDate: date,
      isRecurring,
      eventId,
      newDay
    })

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    console.log('Fetching token for user:', user_id)
    
    // First get the profile ID which is linked to the calendar tokens
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
    
    // Now get the calendar token using the profile ID
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
        error: errorText,
        requestBody: {
          start: { dateTime: startDateTime, timeZone },
          end: { dateTime: endDateTime, timeZone }
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