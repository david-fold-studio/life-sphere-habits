import { Card } from "@/components/ui/card";
import { useState, memo, useEffect } from "react";
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

export const CalendarEvent = memo(function CalendarEvent({ 
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [visualStartTime, setVisualStartTime] = useState(startTime);
  const [visualEndTime, setVisualEndTime] = useState(endTime);

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
      if (sphere === 'google-calendar') {
        onEventUpdate?.(id, newStartTime, newEndTime);
      } else if (isRecurring || hasInvitees) {
        setUpdateDialogOpen(true);
      } else if (onEventUpdate) {
        onEventUpdate(id, newStartTime, newEndTime);
      }
    }
  });

  useEffect(() => {
    const handleVisualUpdate = (e: CustomEvent<{ id: string; newStartTime: string; newEndTime: string }>) => {
      if (e.detail.id === id) {
        setVisualStartTime(e.detail.newStartTime);
        setVisualEndTime(e.detail.newEndTime);
      }
    };

    document.addEventListener('visualTimeUpdate', handleVisualUpdate as EventListener);
    return () => {
      document.removeEventListener('visualTimeUpdate', handleVisualUpdate as EventListener);
    };
  }, [id]);

  // Reset visual times when actual times change
  useEffect(() => {
    setVisualStartTime(startTime);
    setVisualEndTime(endTime);
  }, [startTime, endTime]);

  const [startHours, startMinutes] = visualStartTime.split(":").map(Number);
  const [endHours, endMinutes] = visualEndTime.split(":").map(Number);
  const durationInMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  const shouldWrapText = durationInMinutes >= 30;

  const backgroundColor = sphere === 'google-calendar' 
    ? 'bg-blue-500 text-white' 
    : `bg-[var(--sphere-${sphere})]`;

  const cursor = isOwner ? (isDragging ? 'grabbing' : 'grab') : 'default';

  const handleCardMouseDown = (e: React.MouseEvent) => {
    if (!isOwner) return;
    
    const target = e.target as HTMLElement;
    if (!target.closest('.resize-handle')) {
      handleMouseDown(e);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      setDialogOpen(true);
    }
  };

  return (
    <>
      <Card
        className={`absolute left-0 right-0 mx-0.5 px-[0.5px] overflow-hidden z-20 ${backgroundColor} ${isDragging ? 'opacity-70' : ''}`}
        style={{
          ...calculateEventStyle(visualStartTime, visualEndTime, isDragging),
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
            if (onEventUpdate) {
              onEventUpdate(id, visualStartTime, visualEndTime, updateType, notifyInvitees);
            }
            setUpdateDialogOpen(false);
          }}
        />
      )}
    </>
  );
});