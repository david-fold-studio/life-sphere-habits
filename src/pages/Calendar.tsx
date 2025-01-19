import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, addDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { CalendarHeader } from "@/components/CalendarHeader";
import { CalendarTimeSlots } from "@/components/CalendarTimeSlots";
import { CalendarDayColumn } from "@/components/CalendarDayColumn";

const CalendarView = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: calendarToken, isLoading } = useQuery({
    queryKey: ['calendar-token', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('No user ID available for calendar token query');
        return null;
      }

      console.log('Fetching calendar token for user:', user.id);
      const { data, error } = await supabase
        .from('calendar_tokens')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching calendar token:', error);
        throw error;
      }
      
      console.log('Calendar token query result:', data);
      return data;
    },
    enabled: !!user?.id,
  });

  const handleConnectCalendar = async () => {
    try {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to connect your Google Calendar.",
          variant: "destructive",
        });
        return;
      }

      console.log('Starting Google Calendar authorization for user:', user.id);
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { user_id: user.id },
      });

      if (error) {
        console.error('Error invoking function:', error);
        toast({
          title: "Error",
          description: "Failed to start Google Calendar authorization. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!data?.url) {
        console.error('No URL returned from authorization endpoint');
        toast({
          title: "Error",
          description: "Failed to get authorization URL. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Redirecting to:', data.url);
      window.location.href = data.url;
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const scheduledHabits = [
    { 
      id: "1", 
      name: "Morning Meditation", 
      startTime: "07:00", 
      endTime: "07:30", 
      day: 1,
      sphere: "mental" 
    },
    { 
      id: "2", 
      name: "Evening Run", 
      startTime: "18:00", 
      endTime: "19:00", 
      day: 2,
      sphere: "health"
    },
    { 
      id: "3", 
      name: "Read a Book", 
      startTime: "20:00", 
      endTime: "21:00", 
      day: 3,
      sphere: "education"
    },
    { 
      id: "4", 
      name: "Yoga Session", 
      startTime: "08:00", 
      endTime: "09:00", 
      day: 4,
      sphere: "health"
    },
    { 
      id: "5", 
      name: "Journal Writing", 
      startTime: "21:00", 
      endTime: "21:30", 
      day: 5,
      sphere: "personal"
    },
  ];

  const today = new Date();
  const weekStart = startOfWeek(today);
  
  const weekDays = Array.from({ length: 7 }, (_, i) => ({
    date: addDays(weekStart, i),
    dayIndex: i,
  }));

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8 flex flex-col h-[calc(100vh-4rem)]">
      <CalendarHeader 
        weekStart={weekStart}
        onConnectCalendar={handleConnectCalendar}
      />

      <div className="flex flex-1 overflow-hidden">
        <CalendarTimeSlots />

        <div className="flex-grow flex overflow-auto">
          {weekDays.map(({ date, dayIndex }) => (
            <CalendarDayColumn
              key={dayIndex}
              date={date}
              dayIndex={dayIndex}
              scheduledHabits={scheduledHabits}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
