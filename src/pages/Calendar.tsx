import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, addHours, startOfDay, startOfWeek, addDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { CalendarEvent } from "@/components/CalendarEvent";

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
  
  const timeSlots = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: format(addHours(startOfDay(today), i), "h:mm a"),
  }));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return {
      date,
      dayName: format(date, "EEE"),
      fullDate: format(date, "MMM d"),
    };
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Weekly Schedule</h1>
          <p className="text-muted-foreground">
            Week of {format(weekStart, "MMMM d, yyyy")}
          </p>
        </div>
        
        <Button 
          onClick={handleConnectCalendar}
          className="relative"
        >
          Connect Google Calendar
        </Button>
      </header>

      <div className="flex">
        <div className="w-20 flex-shrink-0">
          <div className="h-16" />
          {timeSlots.map(({ hour, label }) => (
            <div key={hour} className="h-20 border-t text-sm text-muted-foreground pr-2 text-right">
              {label}
            </div>
          ))}
        </div>

        <div className="flex-grow flex">
          {weekDays.map(({ date, dayName, fullDate }, dayIndex) => (
            <div key={dayIndex} className="flex-1 relative border-l first:border-l-0">
              <div className="h-16 border-b p-2 text-center sticky top-0 bg-background">
                <div className="font-semibold">{dayName}</div>
                <div className="text-sm text-muted-foreground">{fullDate}</div>
              </div>

              <div className="relative">
                {timeSlots.map(({ hour }) => (
                  <div
                    key={hour}
                    className="h-20 border-t border-gray-200"
                  />
                ))}

                {scheduledHabits
                  .filter((habit) => habit.day === dayIndex)
                  .map((habit) => (
                    <CalendarEvent
                      key={habit.id}
                      id={habit.id}
                      name={habit.name}
                      startTime={habit.startTime}
                      sphere={habit.sphere}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
