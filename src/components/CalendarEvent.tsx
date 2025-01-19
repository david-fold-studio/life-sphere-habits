import { Card } from "@/components/ui/card";

interface CalendarEventProps {
  id: string;
  name: string;
  startTime: string;
  sphere: string;
}

export function CalendarEvent({ id, name, startTime, sphere }: CalendarEventProps) {
  const getEventStyle = (startTime: string) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const top = (hours * 60 + minutes) * (100 / 1440);
    return {
      top: `${top}%`,
    };
  };

  return (
    <Card
      key={id}
      className={`absolute left-0 right-0 mx-1 p-2`}
      style={{
        ...getEventStyle(startTime),
        backgroundColor: `var(--sphere-${sphere})`,
      }}
    >
      <div className="font-medium text-sm">{name}</div>
    </Card>
  );
}