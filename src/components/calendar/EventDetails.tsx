import { CardContent } from "@/components/ui/card";

interface EventDetailsProps {
  startTime: string;
  endTime: string;
  isOwner: boolean;
  sphere: string;
}

export const EventDetails = ({ startTime, endTime, isOwner, sphere }: EventDetailsProps) => {
  return (
    <CardContent>
      <p className="text-sm text-muted-foreground">Time: {startTime} - {endTime}</p>
      {isOwner && sphere !== 'google-calendar' && (
        <p className="text-sm text-muted-foreground mt-2">
          Tip: You can drag the event to change its time.
        </p>
      )}
    </CardContent>
  );
};