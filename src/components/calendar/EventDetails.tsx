import { CardContent } from "@/components/ui/card";

interface EventDetailsProps {
  startTime: string;
  endTime: string;
  isOwner: boolean;
  sphere: string;
  isRecurring?: boolean;
  frequency?: string;
  invitees?: string[];
}

export const EventDetails = ({ 
  startTime, 
  endTime, 
  isOwner, 
  sphere,
  isRecurring,
  frequency,
  invitees = []
}: EventDetailsProps) => {
  return (
    <CardContent className="space-y-2">
      <p className="text-sm text-muted-foreground">Time: {startTime} - {endTime}</p>
      
      {isRecurring && frequency && (
        <p className="text-sm text-muted-foreground">
          Recurring: {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
        </p>
      )}
      
      {invitees.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <p>Invitees:</p>
          <ul className="list-disc list-inside">
            {invitees.map((email, index) => (
              <li key={index}>{email}</li>
            ))}
          </ul>
        </div>
      )}

      {isOwner && sphere !== 'google-calendar' && (
        <p className="text-sm text-muted-foreground mt-2">
          Tip: You can drag the event to change its time.
        </p>
      )}
    </CardContent>
  );
};