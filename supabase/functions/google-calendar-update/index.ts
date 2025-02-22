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

    // Get the original event to check its details
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
    console.log('Original event details:', eventDetails);

    // Parse the input date and times
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    let updateEndpoint = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;
    let method = 'PATCH';
    
    // For single instance exceptions, work with the correct instance date
    const baseDate = updateType === 'single' && eventDetails.recurrence
      ? new Date(eventDetails.start.dateTime) // Use original event's date
      : new Date(date); // Use provided date for non-recurring events

    // Create the new start and end times
    const newStartDateTime = new Date(baseDate);
    newStartDateTime.setHours(startHour, startMinute, 0);

    const newEndDateTime = new Date(baseDate);
    newEndDateTime.setHours(endHour, endMinute, 0);

    console.log('Creating event times:', {
      newStartDateTime: newStartDateTime.toISOString(),
      newEndDateTime: newEndDateTime.toISOString(),
      timeZone
    });

    let updateBody: any = {
      start: {
        dateTime: newStartDateTime.toISOString(),
        timeZone: timeZone,
      },
      end: {
        dateTime: newEndDateTime.toISOString(),
        timeZone: timeZone,
      },
    };

    // Handle different update types for recurring events
    if (eventDetails.recurrence) {
      if (updateType === 'single') {
        console.log('Creating single instance exception');
        method = 'POST';
        updateEndpoint = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

        // Keep the original date but update the time
        const originalStartDate = new Date(eventDetails.start.dateTime);
        updateBody = {
          ...updateBody,
          originalStartTime: {
            dateTime: originalStartDate.toISOString(),
            timeZone: timeZone,
          },
          recurringEventId: eventId,
          summary: eventDetails.summary,
          description: eventDetails.description,
          location: eventDetails.location,
          status: "confirmed",
          attendees: eventDetails.attendees,
          reminders: eventDetails.reminders,
        };
      } else if (updateType === 'following') {
        // For "this and following", update the recurrence rule
        const untilDate = new Date(baseDate);
        untilDate.setDate(untilDate.getDate() - 1);
        const untilDateStr = untilDate.toISOString().split('T')[0].replace(/-/g, '');
        
        if (eventDetails.recurrence && eventDetails.recurrence[0]) {
          const originalRule = eventDetails.recurrence[0];
          const updatedRule = originalRule.replace(/;?UNTIL=[^;]+/, `UNTIL=${untilDateStr}`);
          updateBody.recurrence = [updatedRule];
        }
      }
      // For 'series' type, we use the default PATCH behavior
    }

    // Add notification preference
    updateBody.sendUpdates = notifyInvitees ? 'all' : 'none';

    console.log('Making calendar API request:', {
      method,
      endpoint: updateEndpoint,
      body: updateBody
    });

    const response = await fetch(updateEndpoint, {
      method: method,
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Calendar API error:', errorData);
      throw new Error('Failed to update event');
    }

    const data = await response.json();
    console.log('Update response:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

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
  };
};
