import { Card } from "@/components/ui/card";
import { useState, memo, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EventEditForm } from "./calendar/EventEditForm";
import { calculateEventStyle } from "./calendar/EventDragLogic";
import { useEventHandlers } from "./calendar/EventHandlers";
import { EventResizeHandles } from "./calendar/EventResizeHandles";
import { EventUpdateDialog } from "./calendar/EventUpdateDialog";

interface CalendarEventProps {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  sphere: string;
  day: number;
  isRecurring?: boolean;
  frequency?: string | null;
  hasInvitees?: boolean;
  isOwner?: boolean;
  onEventUpdate?: (id: string, startTime: string, endTime: string, updateType?: 'single' | 'following' | 'series', notifyInvitees?: boolean) => void;
  onEventDelete?: (id: string) => void;
}

export const CalendarEvent = memo(function CalendarEvent({ 
  id, 
  name, 
  startTime, 
  endTime, 
  sphere,
  day,
  isRecurring = false,
  frequency = null,
  hasInvitees = false,
  isOwner = true,
  onEventUpdate,
  onEventDelete 
}: CalendarEventProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [visualStartTime, setVisualStartTime] = useState(startTime);
  const [visualEndTime, setVisualEndTime] = useState(endTime);
  const [visualDay, setVisualDay] = useState(day);
  const mouseDownTime = useRef<number>(0);
  const dragDistance = useRef<number>(0);
  const startPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const {
    isDragging,
    handleMouseDown,
    handleMouseUp
  } = useEventHandlers({
    id,
    startTime,
    endTime,
    sphere,
    day,
    isOwner,
    onEventUpdate: (id, newStartTime, newEndTime) => {
      if (isRecurring || sphere === 'google-calendar') {
        setVisualStartTime(newStartTime);
        setVisualEndTime(newEndTime);
        setUpdateDialogOpen(true);
      } else if (onEventUpdate) {
        onEventUpdate(id, newStartTime, newEndTime);
      }
    }
  });

  useEffect(() => {
    const handleVisualUpdate = (e: CustomEvent<{ 
      id: string; 
      newStartTime: string; 
      newEndTime: string;
      newDay: number;
    }>) => {
      if (e.detail.id === id) {
        setVisualStartTime(e.detail.newStartTime);
        setVisualEndTime(e.detail.newEndTime);
        setVisualDay(e.detail.newDay);
      }
    };

    document.addEventListener('visualTimeUpdate', handleVisualUpdate as EventListener);
    return () => {
      document.removeEventListener('visualTimeUpdate', handleVisualUpdate as EventListener);
    };
  }, [id]);

  useEffect(() => {
    setVisualStartTime(startTime);
    setVisualEndTime(endTime);
    setVisualDay(day);
  }, [startTime, endTime, day]);

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
      mouseDownTime.current = Date.now();
      startPosition.current = { x: e.clientX, y: e.clientY };
      dragDistance.current = 0;
      handleMouseDown(e);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const timeSinceMouseDown = Date.now() - mouseDownTime.current;
    const dx = Math.abs(e.clientX - startPosition.current.x);
    const dy = Math.abs(e.clientY - startPosition.current.y);
    dragDistance.current = Math.sqrt(dx * dx + dy * dy);

    // Only open form if it was a genuine click (short duration and minimal movement)
    if (timeSinceMouseDown < 200 && dragDistance.current < 5 && !isDragging) {
      setFormOpen(true);
    }
  };

  const handleSave = (data: {
    startTime: string;
    endTime: string;
    date: Date;
    isRecurring: boolean;
    frequency: string | null;
    invitees: string[];
  }) => {
    if (onEventUpdate) {
      onEventUpdate(id, data.startTime, data.endTime);
      setFormOpen(false);
    }
  };

  return (
    <>
      <Card
        className={`absolute left-0 right-0 mx-0.5 px-[0.5px] overflow-hidden z-20 ${backgroundColor} ${isDragging ? 'opacity-70' : ''}`}
        style={{
          ...calculateEventStyle(visualStartTime, visualEndTime, isDragging),
          cursor,
          transform: `translateX(${(visualDay - day) * 100}%)`
        }}
        onMouseDown={handleCardMouseDown}
        onClick={handleCardClick}
      >
        {isOwner && <EventResizeHandles onMouseDown={handleMouseDown} />}
        <div className={`text-[10px] leading-[0.85] font-medium ${shouldWrapText ? 'whitespace-normal' : 'truncate'}`}>
          {name}
          {isRecurring && <span className="ml-1">🔄</span>}
        </div>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="p-0 rounded-3xl overflow-hidden">
          <EventEditForm
            id={id}
            name={name}
            startTime={startTime}
            endTime={endTime}
            date={new Date()}
            isRecurring={isRecurring}
            frequency={frequency}
            sphere={sphere}
            invitees={[]}
            onSave={handleSave}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

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
