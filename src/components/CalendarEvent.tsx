import { Card } from "@/components/ui/card";
import { useState } from "react";
import { EventDialog } from "./calendar/EventDialog";
import { EventUpdateDialog } from "./calendar/EventUpdateDialog";
import { calculateEventStyle } from "./calendar/EventDragLogic";
import { useEventHandlers } from "./calendar/EventHandlers";
import { EventResizeHandles } from "./calendar/EventResizeHandles";

interface CalendarEventProps {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  sphere: string;
  isRecurring?: boolean;
  hasInvitees?: boolean;
  isOwner?: boolean;
  onEventUpdate?: (id: string, startTime: string, endTime: string, updateType?: 'single' | 'series', notifyInvitees?: boolean) => void;
  onEventDelete?: (id: string) => void;
}

export function CalendarEvent({ 
  id, 
  name, 
  startTime, 
  endTime, 
  sphere,
  isRecurring = false,
  hasInvitees = false,
  isOwner = true,
  onEventUpdate,
  onEventDelete 
}: CalendarEventProps) {
  console.log('Rendering CalendarEvent:', { id, name, isOwner, sphere });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  const {
    isDragging,
    handleMouseDown,
    handleMouseUp
  } = useEventHandlers({
    id,
    startTime,
    endTime,
    sphere,
    isOwner,
    onEventUpdate: (id, newStartTime, newEndTime) => {
      console.log('Event update triggered:', { id, newStartTime, newEndTime, sphere });
      if (sphere === 'google-calendar') {
        console.log('Updating Google Calendar event');
        onEventUpdate?.(id, newStartTime, newEndTime);
      } else if (isRecurring || hasInvitees) {
        console.log('Opening update dialog for recurring/invited event');
        setUpdateDialogOpen(true);
      } else if (onEventUpdate) {
        console.log('Updating event directly');
        onEventUpdate(id, newStartTime, newEndTime);
      }
    }
  });

  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);
  const durationInMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  const shouldWrapText = durationInMinutes >= 30;

  const backgroundColor = sphere === 'google-calendar' 
    ? 'bg-blue-500 text-white' 
    : `bg-[var(--sphere-${sphere})]`;

  const cursor = isOwner ? (isDragging ? 'grabbing' : 'grab') : 'default';

  const handleCardMouseDown = (e: React.MouseEvent) => {
    console.log('Card mouse down event:', { id, isOwner, sphere });
    if (!isOwner) return;
    
    // Only handle drag if we clicked directly on the card (not on resize handles)
    const target = e.target as HTMLElement;
    if (!target.closest('.resize-handle')) {
      handleMouseDown(e);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    console.log('Card clicked:', id);
    // Only open dialog if we're not dragging
    if (!isDragging) {
      setDialogOpen(true);
    }
  };

  return (
    <>
      <Card
        className={`absolute left-0 right-0 mx-0.5 px-[0.5px] overflow-hidden z-20 ${backgroundColor} ${isDragging ? 'opacity-70' : ''}`}
        style={{
          ...calculateEventStyle(startTime, endTime, isDragging),
          cursor
        }}
        onMouseDown={handleCardMouseDown}
        onClick={handleCardClick}
      >
        {isOwner && <EventResizeHandles onMouseDown={handleMouseDown} />}
        <div className={`text-[10px] leading-[0.85] font-medium ${shouldWrapText ? 'whitespace-normal' : 'truncate'}`}>
          {name}
        </div>
      </Card>

      <EventDialog
        id={id}
        name={name}
        startTime={startTime}
        endTime={endTime}
        sphere={sphere}
        isOwner={isOwner}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onDelete={onEventDelete}
      />

      {(isRecurring || hasInvitees) && (
        <EventUpdateDialog
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          isRecurring={isRecurring}
          hasInvitees={hasInvitees}
          onUpdate={(updateType, notifyInvitees) => {
            console.log('Update dialog confirmed:', { updateType, notifyInvitees });
            if (onEventUpdate) {
              onEventUpdate(id, startTime, endTime, updateType, notifyInvitees);
            }
            setUpdateDialogOpen(false);
          }}
        />
      )}
    </>
  );
}