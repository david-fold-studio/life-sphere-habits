
import { useState } from 'react';
import { startOfWeek } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchGoogleCalendarEvents, fetchScheduledHabits } from '@/utils/calendarUtils';
import type { ScheduledHabit } from '@/utils/calendarUtils';

export const useCalendar = (userId: string | undefined) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date()));
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: scheduledHabits = [], isLoading: habitsLoading, refetch: refetchHabits } = useQuery({
    queryKey: ["scheduledHabits", userId],
    queryFn: () => fetchScheduledHabits(userId || ""),
    enabled: !!userId,
    staleTime: 0, // Always fetch fresh data
  });

  const { data: googleEvents = [], isLoading: eventsLoading, refetch: refetchGoogleEvents } = useQuery({
    queryKey: ["googleCalendarEvents", userId, currentWeekStart],
    queryFn: () => fetchGoogleCalendarEvents(userId || "", currentWeekStart),
    enabled: !!userId,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true, // Refetch when component mounts
  });

  const handleEventUpdate = async (
    id: string, 
    startTime: string, 
    endTime: string, 
    updateType: 'single' | 'following' | 'series' = 'single',
    notifyInvitees: boolean = false
  ) => {
    try {
      const isGoogleEvent = !id.includes('-');
      
      if (isGoogleEvent) {
        console.log('Updating Google Calendar event:', { id, startTime, endTime, updateType, notifyInvitees });
        
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        const { data, error } = await supabase.functions.invoke('google-calendar-update', {
          body: { 
            eventId: id,
            startTime,
            endTime,
            date: currentWeekStart.toISOString(),
            user_id: userId,
            timeZone: userTimeZone,
            updateType,
            notifyInvitees
          }
        });

        if (error) throw error;

        // Invalidate entire query cache for Google events
        await queryClient.invalidateQueries({ queryKey: ["googleCalendarEvents"] });
        // Force refetch to get the updated events
        await refetchGoogleEvents();
        
        toast({
          title: "Event updated",
          description: "The event has been updated in Google Calendar.",
        });
      } else {
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) {
          throw new Error('Invalid UUID format');
        }

        const { error } = await supabase
          .from('scheduled_habits')
          .update({ 
            starttime: startTime, 
            endtime: endTime,
            update_type: updateType
          })
          .eq('id', id);

        if (error) throw error;
        
        // Invalidate entire query cache for scheduled habits
        await queryClient.invalidateQueries({ queryKey: ["scheduledHabits"] });
        await refetchHabits();

        toast({
          title: "Event updated",
          description: "The event time has been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update the event time.",
        variant: "destructive",
      });
      
      // Force refetch to ensure UI is in sync with server state
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["scheduledHabits"] }),
        queryClient.invalidateQueries({ queryKey: ["googleCalendarEvents"] }),
        refetchHabits(),
        refetchGoogleEvents()
      ]);
    }
  };

  const handleEventDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_habits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["scheduledHabits"] });
      await refetchHabits();

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
      
      await queryClient.invalidateQueries({ queryKey: ["scheduledHabits"] });
      await refetchHabits();
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
