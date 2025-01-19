import { format } from "date-fns";
import { CalendarEvent } from "./CalendarEvent";

interface ScheduledHabit {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  day: number;
  sphere: string;
}

interface CalendarDayColumnProps {
  date: Date;
  dayIndex: number;
  scheduledHabits: ScheduledHabit[];
}

export function CalendarDayColumn({ date, dayIndex, scheduledHabits }: CalendarDayColumnProps) {
  const timeSlots = Array.from({ length: 24 }, (_, hour) => hour);
  
  return (
    <div className="flex-1 relative border-l first:border-l-0">
      <div className="h-16 border-b p-2 text-center sticky top-0 bg-background">
        <div className="font-semibold">{format(date, "EEE")}</div>
        <div className="text-sm text-muted-foreground">{format(date, "MMM d")}</div>
      </div>

      <div className="relative">
        {timeSlots.map((hour) => (
          <div
            key={hour}
            className="h-[13px] border-t border-gray-200"
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
  );
}