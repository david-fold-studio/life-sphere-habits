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
  onEventUpdate: (id: string, startTime: string, endTime: string) => void;
  onEventDelete: (id: string) => void;
}

export function CalendarDayColumn({ 
  dayIndex, 
  scheduledHabits,
  onEventUpdate,
  onEventDelete
}: CalendarDayColumnProps) {
  const timeSlots = Array.from({ length: 24 }, (_, hour) => hour);
  
  return (
    <div className="flex-1 relative border-l first:border-l-0 min-h-full">
      <div className="absolute inset-0 pointer-events-none">
        {timeSlots.map((hour) => (
          <div
            key={hour}
            className="h-[48px] border-t border-gray-200"
          />
        ))}
      </div>

      <div className="absolute inset-0 z-10">
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
              day={habit.day}
              onEventUpdate={onEventUpdate}
              onEventDelete={onEventDelete}
            />
          ))}
      </div>
    </div>
  );
}