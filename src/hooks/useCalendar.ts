import { useState } from 'react';
import { startOfWeek } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchGoogleCalendarEvents, fetchScheduledHabits } from '@/utils/calendarUtils';
import type { ScheduledHabit } from '@/utils/calendarUtils';

export const useCalendar = (userId: string | undefined) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date()));
  const { toast } = useToast();

  const { data: scheduledHabits = [], isLoading: habitsLoading, refetch: refetchHabits } = useQuery({
    queryKey: ["scheduledHabits", userId],
    queryFn: () => fetchScheduledHabits(userId || ""),
    enabled: !!userId
  });

  const { data: googleEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["googleCalendarEvents", userId, currentWeekStart],
    queryFn: () => fetchGoogleCalendarEvents(userId || "", currentWeekStart),
    enabled: !!userId
  });

  const handleEventUpdate = async (id: string, startTime: string, endTime: string, updateType: 'single' | 'series' = 'single', notifyInvitees: boolean = false) => {
    try {
      const { error } = await supabase
        .from('scheduled_habits')
        .update({ 
          starttime: startTime, 
          endtime: endTime 
        })
        .eq('id', id);

      if (error) throw error;

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
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to connect your Google Calendar.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { user_id: userId }
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

  const allEvents: ScheduledHabit[] = [
    ...scheduledHabits,
    ...googleEvents.map(event => ({
      ...event,
      sphere: 'google-calendar'
    }))
  ];

  return {
    currentWeekStart,
    setCurrentWeekStart,
    allEvents,
    isLoading: habitsLoading || eventsLoading,
    handleEventUpdate,
    handleEventDelete,
    handleGoogleCalendarConnect
  };
};