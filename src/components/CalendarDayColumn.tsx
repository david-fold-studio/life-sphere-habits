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

export function CalendarDayColumn({ dayIndex, scheduledHabits }: CalendarDayColumnProps) {
  const timeSlots = Array.from({ length: 24 }, (_, hour) => hour);
  
  return (
    <div className="flex-1 relative border-l first:border-l-0">
      <div className="relative">
        {timeSlots.map((hour) => (
          <div
            key={hour}
            className="h-[48px] border-t border-gray-200"
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
              endTime={habit.endTime}
              sphere={habit.sphere}
            />
          ))}
      </div>
    </div>
  );
}