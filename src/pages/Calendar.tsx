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

const fetchScheduledHabits = async (userId: string) => {
  const { data, error } = await supabase
    .from("scheduled_habits")
    .select("*")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return data;
};

export default function CalendarView() {
  const { user } = useAuth();
  const { toast } = useToast();

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfWeek(new Date()), i);
    return { date, dayIndex: i };
  });

  const { data: scheduledHabits = [], isLoading, error } = useQuery(
    ["scheduledHabits", user?.id],
    () => fetchScheduledHabits(user.id),
    { enabled: !!user }
  );

  const handleGoogleCalendarConnect = async () => {
    // Handle Google Calendar connection logic
  };

  const isConnected = false; // Replace with actual connection state

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
      <CalendarHeader
        onGoogleCalendarConnect={handleGoogleCalendarConnect}
        isConnected={isConnected}
      />

      <div className="flex-1 overflow-hidden">
        <CalendarWeekHeader weekDays={weekDays} />
        <CalendarGrid 
          weekDays={weekDays}
          scheduledHabits={scheduledHabits}
        />
      </div>
    </div>
  );
}
