import { useEffect, useRef } from "react";
import { CalendarTimeSlots } from "./CalendarTimeSlots";
import { CalendarDayColumn } from "./CalendarDayColumn";

interface ScheduledHabit {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  day: number;
  sphere: string;
}

interface CalendarGridProps {
  weekDays: Array<{
    date: Date;
    dayIndex: number;
  }>;
  scheduledHabits: ScheduledHabit[];
  onEventUpdate: (id: string, startTime: string, endTime: string) => void;
  onEventDelete: (id: string) => void;
}

export function CalendarGrid({ 
  weekDays, 
  scheduledHabits,
  onEventUpdate,
  onEventDelete
}: CalendarGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const scrollPosition = (minutes * 48) / 60;
      const containerHeight = scrollContainerRef.current.clientHeight;
      scrollContainerRef.current.scrollTop = scrollPosition - (containerHeight / 2);
    }
  }, []);

  return (
    <div 
      ref={scrollContainerRef}
      className="flex overflow-y-auto relative"
      style={{ height: 'calc(100vh - 12rem)' }}
    >
      <CalendarTimeSlots />
      <div className="flex flex-1 relative min-h-[1152px]">
        {weekDays.map(({ date, dayIndex }) => (
          <CalendarDayColumn
            key={dayIndex}
            date={date}
            dayIndex={dayIndex}
            scheduledHabits={scheduledHabits}
            onEventUpdate={onEventUpdate}
            onEventDelete={onEventDelete}
          />
        ))}
      </div>
    </div>
  );
}