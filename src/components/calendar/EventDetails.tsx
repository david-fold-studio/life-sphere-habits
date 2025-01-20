import { cn } from "@/lib/utils";

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
    <div className="space-y-3">
      <div className={cn(
        "p-2 rounded-md",
        sphere === 'google-calendar' ? 'bg-blue-50' : `bg-[var(--sphere-${sphere})]`
      )}>
        <p className="text-sm font-medium">Time: {startTime} - {endTime}</p>
      </div>
      
      {isRecurring && (
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="mr-2">🔄</span>
          Recurring event
        </div>
      )}
      
      {hasInvitees && (
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="mr-2">👥</span>
          Has invitees
        </div>
      )}

      {isOwner && sphere !== 'google-calendar' && (
        <p className="text-sm text-muted-foreground mt-4 italic">
          Tip: You can drag the event to change its time
        </p>
      )}
    </div>
  );
};