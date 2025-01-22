import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { startOfWeek, addDays } from "date-fns";
import { CalendarHeader } from "@/components/CalendarHeader";
import { CalendarWeekHeader } from "@/components/CalendarWeekHeader";
import { CalendarGrid } from "@/components/CalendarGrid";
import { useCalendar } from "@/hooks/useCalendar";
import { TitleBar } from "@/components/TitleBar";

export default function CalendarView() {
  const { user } = useAuth();
  
  const {
    currentWeekStart,
    setCurrentWeekStart,
    allEvents,
    isLoading,
    handleEventUpdate,
    handleEventDelete,
    handleGoogleCalendarConnect
  } = useCalendar(user?.id);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeekStart, i);
    return { date, dayIndex: i };
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <TitleBar 
        title="Calendar" 
        description="Manage your schedule and recurring habits"
      />
      <div className="flex-none p-8 pb-0">
        <CalendarHeader
          weekStart={currentWeekStart}
          onConnectCalendar={handleGoogleCalendarConnect}
          onWeekChange={setCurrentWeekStart}
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