import { CardContent } from "@/components/ui/card";

interface EventDetailsProps {
  startTime: string;
  endTime: string;
  isOwner: boolean;
  sphere: string;
  isRecurring?: boolean;
  hasInvitees?: boolean;
}

export const EventDetails = ({ 
  startTime, 
  endTime, 
  isOwner, 
  sphere,
  isRecurring,
  hasInvitees
}: EventDetailsProps) => {
  return (
    <CardContent className="space-y-2">
      <p className="text-sm text-muted-foreground">Time: {startTime} - {endTime}</p>
      
      {isRecurring && (
        <p className="text-sm text-muted-foreground">
          Recurring event
        </p>
      )}
      
      {hasInvitees && (
        <p className="text-sm text-muted-foreground">
          Has invitees
        </p>
      )}

      {isOwner && sphere !== 'google-calendar' && (
        <p className="text-sm text-muted-foreground mt-2">
          Tip: You can drag the event to change its time.
        </p>
      )}
    </CardContent>
  );
};