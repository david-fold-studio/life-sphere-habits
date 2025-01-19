import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { eventId, startTime, endTime, date, user_id } = await req.json();
    
    if (!eventId || !startTime || !endTime || !date || !user_id) {
      throw new Error('Missing required parameters');
    }

    // Get the user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: tokenData, error: tokenError } = await supabase
      .from('calendar_tokens')
      .select('access_token')
      .eq('user_id', user_id)
      .single();

    if (tokenError || !tokenData) {
      throw new Error('No valid token found');
    }

    // Convert time strings to RFC3339 format
    const [hours, minutes] = startTime.split(':');
    const [endHours, endMinutes] = endTime.split(':');
    
    const startDate = new Date(date);
    const endDate = new Date(date);
    
    startDate.setHours(parseInt(hours), parseInt(minutes), 0);
    endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0);

    console.log('Updating event:', {
      eventId,
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString()
    });

    // Update the event in Google Calendar
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start: { dateTime: startDate.toISOString() },
          end: { dateTime: endDate.toISOString() },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Calendar API error:', errorData);
      throw new Error('Failed to update calendar event');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error updating event:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});