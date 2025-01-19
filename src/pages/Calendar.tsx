import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, addDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { CalendarHeader } from "@/components/CalendarHeader";
import { CalendarWeekHeader } from "@/components/CalendarWeekHeader";
import { CalendarGrid } from "@/components/CalendarGrid";

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

const fetchScheduledHabits = async (userId: string): Promise<ScheduledHabit[]> => {
  const { data, error } = await supabase
    .from("scheduled_habits")
    .select("*")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  
  // Map the database rows to our ScheduledHabit interface
  return (data || []).map((habit: ScheduledHabitRow) => ({
    id: habit.id,
    name: habit.name,
    startTime: habit.starttime,
    endTime: habit.endtime,
    day: habit.day,
    sphere: habit.sphere
  }));
};

export default function CalendarView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const weekStart = startOfWeek(new Date());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return { date, dayIndex: i };
  });

  const { data: scheduledHabits = [], isLoading, error } = useQuery({
    queryKey: ["scheduledHabits", user?.id],
    queryFn: () => fetchScheduledHabits(user?.id || ""),
    enabled: !!user
  });

  const handleGoogleCalendarConnect = async () => {
    toast({
      title: "Coming soon",
      description: "Google Calendar integration will be available soon.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-destructive">Failed to load calendar data</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-none p-8 pb-0">
        <CalendarHeader
          weekStart={weekStart}
          onConnectCalendar={handleGoogleCalendarConnect}
        />
      </div>
      <div className="flex-none">
        <CalendarWeekHeader weekDays={weekDays} />
      </div>
      <div className="flex-1 overflow-hidden">
        <CalendarGrid 
          weekDays={weekDays}
          scheduledHabits={scheduledHabits}
        />
      </div>
    </div>
  );
}