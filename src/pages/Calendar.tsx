import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, addDays, format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { CalendarHeader } from "@/components/CalendarHeader";
import { CalendarWeekHeader } from "@/components/CalendarWeekHeader";
import { CalendarGrid } from "@/components/CalendarGrid";
import { useState } from "react";

interface ScheduledHabit {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  day: number;
  sphere: string;
}

interface ScheduledHabitRow {
  id: string;
  name: string;
  starttime: string;
  endtime: string;
  day: number;
  sphere: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface GoogleCalendarEvent {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  day: number;
}

const fetchScheduledHabits = async (userId: string): Promise<ScheduledHabit[]> => {
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

const fetchGoogleCalendarEvents = async (userId: string, weekStart: Date): Promise<GoogleCalendarEvent[]> => {
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

    // Format the date range for the API request
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

export default function CalendarView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date()));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeekStart, i);
    return { date, dayIndex: i };
  });

  const { data: scheduledHabits = [], isLoading: habitsLoading, refetch: refetchHabits } = useQuery({
    queryKey: ["scheduledHabits", user?.id],
    queryFn: () => fetchScheduledHabits(user?.id || ""),
    enabled: !!user
  });

  const { data: googleEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["googleCalendarEvents", user?.id, currentWeekStart],
    queryFn: () => fetchGoogleCalendarEvents(user?.id || "", currentWeekStart),
    enabled: !!user
  });

  const handleEventUpdate = async (id: string, startTime: string, endTime: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_habits')
        .update({ 
          starttime: startTime, 
          endtime: endTime 
        })
        .eq('id', id);

      if (error) throw error;

      // Refetch habits to update the UI
      refetchHabits();

      toast({
        title: "Event updated",
        description: "The event time has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update the event time.",
        variant: "destructive",
      });
    }
  };

  const handleEventDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_habits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refetch habits to update the UI
      refetchHabits();

      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete the event.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleCalendarConnect = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to connect your Google Calendar.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { user_id: user.id }
      });

      if (error) throw error;

      window.location.href = data.url;
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      toast({
        title: "Connection failed",
        description: "Failed to connect to Google Calendar. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleWeekChange = (newDate: Date) => {
    setCurrentWeekStart(newDate);
  };

  const isLoading = habitsLoading || eventsLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Combine scheduled habits and Google Calendar events
  const allEvents = [
    ...scheduledHabits,
    ...googleEvents.map(event => ({
      ...event,
      sphere: 'google-calendar' // Add a special sphere for Google Calendar events
    }))
  ];

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-none p-8 pb-0">
        <CalendarHeader
          weekStart={currentWeekStart}
          onConnectCalendar={handleGoogleCalendarConnect}
          onWeekChange={handleWeekChange}
        />
      </div>
      <div className="flex-none">
        <CalendarWeekHeader weekDays={weekDays} />
      </div>
      <div className="flex-1 overflow-hidden">
        <CalendarGrid 
          weekDays={weekDays}
          scheduledHabits={allEvents}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
        />
      </div>
    </div>
  );
}