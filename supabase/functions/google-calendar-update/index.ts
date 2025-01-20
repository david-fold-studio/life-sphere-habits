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
    const { eventId, startTime, endTime, date, user_id, timeZone, newDay, isRecurring, frequency } = await req.json()
    
    console.log('Received request:', { eventId, startTime, endTime, date, user_id, timeZone, newDay, isRecurring, frequency })

    // Parse the current event date
    const currentDate = new Date(date)
    if (isNaN(currentDate.getTime())) {
      throw new Error('Invalid date provided')
    }

    // Get the current day of the week (0-6)
    const currentDay = currentDate.getDay()
    
    // Calculate how many days to move based on column difference
    const daysDifference = (newDay !== undefined ? newDay : currentDay) - currentDay
    
    // Create new date by adding/subtracting the days difference
    const targetDate = new Date(currentDate)
    targetDate.setDate(currentDate.getDate() + daysDifference)

    console.log('Date calculations:', {
      currentDate: currentDate.toISOString(),
      currentDay,
      newDay,
      daysDifference,
      resultingDate: targetDate.toISOString()
    })

    // Parse the time components
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
      throw new Error('Invalid time format')
    }

    // Format the date components
    const year = targetDate.getFullYear()
    const month = String(targetDate.getMonth() + 1).padStart(2, '0')
    const day = String(targetDate.getDate()).padStart(2, '0')

    // Create RFC3339 formatted datetime strings with the timezone
    const startDateTime = `${year}-${month}-${day}T${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}:00`
    const endDateTime = `${year}-${month}-${day}T${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`

    console.log('Time calculations:', {
      startDateTime,
      endDateTime,
      timeZone
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

    // First, get the event to check its current recurrence settings
    const getResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!getResponse.ok) {
      const errorText = await getResponse.text()
      console.error('Failed to fetch event:', errorText)
      throw new Error(`Failed to fetch event: ${errorText}`)
    }

    const eventData = await getResponse.json()
    console.log('Current event data:', eventData)

    // Prepare the update payload
    const updatePayload: any = {
      start: {
        dateTime: startDateTime,
        timeZone
      },
      end: {
        dateTime: endDateTime,
        timeZone
      }
    }

    // If the event is recurring and we're updating the frequency
    if (isRecurring && frequency && frequency !== 'custom') {
      updatePayload.recurrence = [`RRULE:FREQ=${frequency.toUpperCase()}`]
    }

    const googleResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      }
    )

    if (!googleResponse.ok) {
      const errorText = await googleResponse.text()
      console.error('Google Calendar API error:', {
        status: googleResponse.status,
        statusText: googleResponse.statusText,
        error: errorText,
        requestBody: updatePayload
      })
      throw new Error(`Failed to update calendar event: ${googleResponse.status} ${googleResponse.statusText} - ${errorText}`)
    }

    const responseData = await googleResponse.json()
    console.log('Successfully updated event:', responseData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        event: responseData,
        isRecurring: !!responseData.recurrence,
        frequency: responseData.recurrence ? 'custom' : null
      }),
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