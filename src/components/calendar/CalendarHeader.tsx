import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface CalendarHeaderProps {
  weekStart: Date;
  onConnectCalendar: () => void;
}

export const CalendarHeader = ({ weekStart, onConnectCalendar }: CalendarHeaderProps) => {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Weekly Schedule</h1>
        <p className="text-muted-foreground">
          Week of {format(weekStart, "MMMM d, yyyy")}
        </p>
      </div>
      
      <Button 
        onClick={onConnectCalendar}
        className="relative"
      >
        Connect Google Calendar
      </Button>
    </header>
  );
};