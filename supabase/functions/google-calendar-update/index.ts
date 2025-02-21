
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
    const {
      eventId,
      startTime,
      endTime,
      date,
      user_id,
      timeZone,
      updateType = 'single',
      notifyInvitees = false
    } = await req.json()

    console.log('Received update request:', {
      eventId,
      startTime,
      endTime,
      date,
      updateType,
      timeZone
    });

    // Get the user's calendar token
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject()
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: tokenData, error: tokenError } = await supabase
      .from('calendar_tokens')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (tokenError || !tokenData) {
      throw new Error('Failed to get calendar token')
    }

    // Parse the date and times to create proper ISO strings
    const [year, month, day] = new Date(date).toISOString().split('T')[0].split('-')
    const [startHour, startMinute] = startTime.split(':')
    const [endHour, endMinute] = endTime.split(':')

    const startDateTime = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(startHour),
      Number(startMinute)
    ).toISOString()

    const endDateTime = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(endHour),
      Number(endMinute)
    ).toISOString()

    console.log('Calculated datetime:', { startDateTime, endDateTime });

    // Get the current event to check if it's recurring
    const getResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!getResponse.ok) {
      throw new Error('Failed to fetch event details');
    }

    const eventDetails = await getResponse.json();
    console.log('Event details:', eventDetails);

    let updateEndpoint = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;
    let updateBody: any = {
      start: {
        dateTime: startDateTime,
        timeZone: timeZone,
      },
      end: {
        dateTime: endDateTime,
        timeZone: timeZone,
      },
    };

    // Handle different update types for recurring events
    if (eventDetails.recurrence) {
      if (updateType === 'single') {
        // For single instance update, create a new exception
        updateEndpoint = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}/instances/${eventDetails.id}`;
      } else if (updateType === 'following') {
        // For this and following, set the recurrence until the day before
        const eventDate = new Date(date);
        eventDate.setDate(eventDate.getDate() - 1);
        const untilDate = eventDate.toISOString().split('T')[0].replace(/-/g, '');
        
        // Update the original event's recurrence rule
        const originalRecurrenceRule = eventDetails.recurrence[0];
        const updatedRecurrenceRule = originalRecurrenceRule.replace(/UNTIL=[^;]+/, `UNTIL=${untilDate}`);
        updateBody.recurrence = [updatedRecurrenceRule];
      }
    }

    // Add notification preference
    updateBody.sendUpdates = notifyInvitees ? 'all' : 'none';

    console.log('Update request:', {
      endpoint: updateEndpoint,
      body: updateBody
    });

    const response = await fetch(updateEndpoint, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateBody),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Google Calendar API error:', errorData)
      throw new Error('Failed to update event')
    }

    const data = await response.json()
    console.log('Update response:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// Helper to create Supabase client
const createClient = (supabaseUrl: string, supabaseKey: string) => {
  return {
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (column: string, value: string) => ({
          single: () => fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns}&${column}=eq.${value}`, {
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey,
            },
          }).then(res => res.json()).then(data => ({ data: data[0], error: null })),
        }),
      }),
    }),
  }
}
