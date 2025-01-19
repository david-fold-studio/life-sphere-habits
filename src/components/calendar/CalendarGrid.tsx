import { format, addDays, startOfWeek } from "date-fns";
import { Card } from "@/components/ui/card";

interface ScheduledHabit {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  day: number;
  sphere: string;
}

interface CalendarGridProps {
  scheduledHabits: ScheduledHabit[];
}

export const CalendarGrid = ({ scheduledHabits }: CalendarGridProps) => {
  const today = new Date();
  const weekStart = startOfWeek(today);
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return {
      date,
      dayName: format(date, "EEE"),
      fullDate: format(date, "MMM d"),
    };
  });

  const getEventStyle = (startTime: string) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const top = (hours * 60 + minutes) * (100 / 1440);
    return {
      top: `${top}%`,
    };
  };

  return (
    <div className="flex">
      <div className="flex-grow flex">
        {weekDays.map(({ date, dayName, fullDate }, dayIndex) => (
          <div key={dayIndex} className="flex-1 relative border-l first:border-l-0">
            <div className="h-16 border-b p-2 text-center sticky top-0 bg-background">
              <div className="font-semibold">{dayName}</div>
              <div className="text-sm text-muted-foreground">{fullDate}</div>
            </div>

            <div className="relative">
              {scheduledHabits
                .filter((habit) => habit.day === dayIndex)
                .map((habit) => (
                  <Card
                    key={habit.id}
                    className={`absolute left-0 right-0 mx-1 p-2`}
                    style={{
                      ...getEventStyle(habit.startTime),
                      backgroundColor: `var(--sphere-${habit.sphere})`,
                    }}
                  >
                    <div className="font-medium text-sm">{habit.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {habit.startTime} - {habit.endTime}
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};