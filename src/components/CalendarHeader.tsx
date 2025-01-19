import { format, addWeeks, subWeeks } from "date-fns";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
  weekStart: Date;
  onConnectCalendar: () => void;
  onWeekChange: (newDate: Date) => void;
}

export function CalendarHeader({ weekStart, onConnectCalendar, onWeekChange }: CalendarHeaderProps) {
  const handlePreviousWeek = () => {
    onWeekChange(subWeeks(weekStart, 1));
  };

  const handleNextWeek = () => {
    onWeekChange(addWeeks(weekStart, 1));
  };

  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Weekly Schedule</h1>
          <p className="text-muted-foreground">
            Week of {format(weekStart, "MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousWeek}
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextWeek}
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Button 
        onClick={onConnectCalendar}
        className="relative"
      >
        Connect Google Calendar
      </Button>
    </header>
  );
}