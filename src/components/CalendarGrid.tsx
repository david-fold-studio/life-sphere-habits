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
  return (
    <div className="flex overflow-y-auto" style={{ height: 'calc(100% - 4rem)' }}>
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