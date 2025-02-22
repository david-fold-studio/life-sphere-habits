
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

    // Parse the base date
    const baseDate = new Date(date);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Create dates in the user's time zone
    const startDateTime = new Date(baseDate);
    startDateTime.setHours(startHour, startMinute, 0);

    const endDateTime = new Date(baseDate);
    endDateTime.setHours(endHour, endMinute, 0);

    console.log('Creating event times:', {
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      timeZone
    });

    let updateEndpoint = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;
    let method = 'PATCH';
    let updateBody: any = {
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: timeZone,
      },
    };

    // Handle different update types for recurring events
    if (eventDetails.recurrence) {
      if (updateType === 'single') {
        console.log('Creating single instance exception');
        method = 'POST';  // Use POST to create a new instance
        updateEndpoint = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
        
        updateBody = {
          ...updateBody,
          originalStartTime: eventDetails.start,
          recurringEventId: eventId,
          summary: eventDetails.summary,
          status: "confirmed",
          attendees: eventDetails.attendees,
          description: eventDetails.description,
          location: eventDetails.location,
          reminders: eventDetails.reminders,
        };
      } else if (updateType === 'following') {
        // For this and following, update the recurrence rule
        const eventDate = new Date(date);
        eventDate.setDate(eventDate.getDate() - 1);
        const untilDate = eventDate.toISOString().split('T')[0].replace(/-/g, '');
        
        if (eventDetails.recurrence && eventDetails.recurrence[0]) {
          const originalRecurrenceRule = eventDetails.recurrence[0];
          const updatedRecurrenceRule = originalRecurrenceRule.replace(/UNTIL=[^;]+/, `UNTIL=${untilDate}`);
          updateBody.recurrence = [updatedRecurrenceRule];
        }
      }
      // For 'series' type, we use the default PATCH behavior to update the entire series
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

