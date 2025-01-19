import { Card } from "@/components/ui/card";

interface CalendarEventProps {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  sphere: string;
}

export function CalendarEvent({ id, name, startTime, endTime, sphere }: CalendarEventProps) {
  const getEventStyle = (startTime: string, endTime: string) => {
    // Convert times to minutes since midnight
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);
    
    const startInMinutes = startHours * 60 + startMinutes;
    const endInMinutes = endHours * 60 + endMinutes;
    
    // Calculate duration in minutes
    const durationInMinutes = endInMinutes - startInMinutes;
    
    // Calculate height (48px per hour = 0.8px per minute)
    const height = durationInMinutes * (48 / 60);
    
    // Calculate top position (48px per hour)
    const top = startInMinutes * (48 / 60);

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  // Calculate if event is long enough to show wrapped text (more than 30 minutes)
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);
  const durationInMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  const shouldWrapText = durationInMinutes >= 30;

  return (
    <Card
      key={id}
      className={`absolute left-0 right-0 mx-1 p-1 overflow-hidden z-20`}
      style={{
        ...getEventStyle(startTime, endTime),
        backgroundColor: `var(--sphere-${sphere})`,
      }}
    >
      <div className={`font-medium text-xs ${shouldWrapText ? 'whitespace-normal' : 'truncate'}`}>
        {name}
      </div>
    </Card>
  );
}