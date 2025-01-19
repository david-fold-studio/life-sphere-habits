import { format } from "date-fns";

interface CalendarWeekHeaderProps {
  weekDays: Array<{
    date: Date;
    dayIndex: number;
  }>;
}

export function CalendarWeekHeader({ weekDays }: CalendarWeekHeaderProps) {
  return (
    <div className="flex bg-background">
      <div className="w-20 flex-shrink-0">
        <div className="h-16" /> {/* Time column spacer */}
      </div>
      <div className="flex flex-1">
        {weekDays.map(({ date, dayIndex }) => (
          <div key={dayIndex} className="flex-1 border-l first:border-l-0">
            <div className="h-16 border-b p-2 text-center">
              <div className="font-semibold">{format(date, "EEE")}</div>
              <div className="text-sm text-muted-foreground">
                {format(date, "MMM d")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}