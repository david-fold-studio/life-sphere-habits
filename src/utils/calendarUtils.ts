import { format, addDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export interface ScheduledHabitRow {
  id: string;
  name: string;
  starttime: string;
  endtime: string;
  day: number;
  sphere: string;
}

export interface ScheduledHabit {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  day: number;
  sphere: string;
}

export interface GoogleCalendarEvent {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  day: number;
}

export const fetchScheduledHabits = async (userId: string): Promise<ScheduledHabit[]> => {
  console.log('Fetching habits for user:', userId);
  const { data, error } = await supabase
    .from("scheduled_habits")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error('Error fetching habits:', error);
    throw new Error(error.message);
  }
  
  console.log('Fetched habits:', data);
  
  return (data || []).map((habit: ScheduledHabitRow) => ({
    id: habit.id,
    name: habit.name,
    startTime: habit.starttime,
    endTime: habit.endtime,
    day: habit.day,
    sphere: habit.sphere
  }));
};

export const fetchGoogleCalendarEvents = async (userId: string, weekStart: Date): Promise<GoogleCalendarEvent[]> => {
  try {
    const { data: tokenData, error: tokenError } = await supabase
      .from('calendar_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      console.error('No calendar token found:', tokenError);
      return [];
    }

    const timeMin = format(weekStart, "yyyy-MM-dd'T'00:00:00'Z'");
    const timeMax = format(addDays(weekStart, 7), "yyyy-MM-dd'T'00:00:00'Z'");

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch calendar events');
    }

    const data = await response.json();
    console.log('Google Calendar events:', data);

    return data.items.map((event: any) => {
      const startDate = new Date(event.start.dateTime || event.start.date);
      return {
        id: event.id,
        name: event.summary,
        startTime: format(startDate, 'HH:mm'),
        endTime: format(new Date(event.end.dateTime || event.end.date), 'HH:mm'),
        day: startDate.getDay(),
      };
    });
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    return [];
  }
};