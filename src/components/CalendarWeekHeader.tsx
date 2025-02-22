import { format, isToday } from "date-fns";
interface CalendarWeekHeaderProps {
  weekDays: Array<{
    date: Date;
    dayIndex: number;
  }>;
}
export function CalendarWeekHeader({
  weekDays
}: CalendarWeekHeaderProps) {
  return <div className="flex bg-background sticky top-0 z-50 shadow-sm">
      <div className="w-20 flex-shrink-0 bg-white">
        <div className="h-16" /> {/* Time column spacer */}
      </div>
      <div className="flex flex-1">
        {weekDays.map(({
        date,
        dayIndex
      }) => <div key={dayIndex} className="flex-1 border-l first:border-l-0">
            <div className="h-16 border-b p-2 text-center bg-white relative z-50">
              <div className={`font-semibold ${isToday(date) ? 'text-white' : ''}`}>
                <div className={`inline-flex flex-col items-center justify-center rounded-full ${isToday(date) ? 'bg-black' : ''} ${isToday(date) ? 'p-2' : ''}`}>
                  <span className="font-normal">{format(date, "EEE")}</span>
                  <span className="text-sm font-normal">{format(date, "MMM d")}</span>
                </div>
              </div>
            </div>
          </div>)}
      </div>
    </div>;
}