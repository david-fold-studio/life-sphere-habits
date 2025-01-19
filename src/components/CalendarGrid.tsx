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
}

export function CalendarGrid({ weekDays, scheduledHabits }: CalendarGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      // Get current time in minutes since midnight
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      
      // Calculate scroll position (48px per hour = 0.8px per minute)
      const scrollPosition = (minutes * 48) / 60;
      
      // Center the current time in the viewport
      const containerHeight = scrollContainerRef.current.clientHeight;
      scrollContainerRef.current.scrollTop = scrollPosition - (containerHeight / 2);
    }
  }, []);

  return (
    <div 
      ref={scrollContainerRef}
      className="flex overflow-y-auto"
      style={{ height: 'calc(100vh - 12rem)' }}
    >
      <CalendarTimeSlots />
      <div className="flex flex-1">
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
  );
}