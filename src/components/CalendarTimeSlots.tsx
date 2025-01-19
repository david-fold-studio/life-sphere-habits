import { format, addHours, startOfDay } from "date-fns";

interface TimeSlot {
  hour: number;
  label: string;
}

export function CalendarTimeSlots() {
  const today = new Date();
  const timeSlots: TimeSlot[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: format(addHours(startOfDay(today), i), "h:mm a"),
  }));

  return (
    <div className="w-20 flex-shrink-0">
      <div className="h-16" />
      {timeSlots.map(({ hour, label }) => (
        <div 
          key={hour} 
          className="h-[32px] border-t text-sm text-muted-foreground pr-2 text-right"
        >
          {label}
        </div>
      ))}
    </div>
  );
}