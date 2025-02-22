
import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EventEditForm } from "./calendar/EventEditForm";
import { calculateEventStyle } from "./calendar/EventDragLogic";
import { useEventHandlers } from "./calendar/EventHandlers";
import { EventResizeHandles } from "./calendar/EventResizeHandles";
import { EventUpdateDialog } from "./calendar/EventUpdateDialog";
import { EventContent } from "./calendar/EventContent";
import { useEventVisualState } from "@/hooks/useEventVisualState";

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

export const CalendarEvent = ({ 
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
}: CalendarEventProps) => {
  const [formOpen, setFormOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const mouseDownTime = useRef<number>(0);
  const dragDistance = useRef<number>(0);
  const startPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pendingUpdate = useRef<{ startTime: string; endTime: string } | null>(null);

  const { visualStartTime, visualEndTime, visualDay } = useEventVisualState({
    startTime,
    endTime,
    day,
    id
  });

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
        pendingUpdate.current = { startTime: newStartTime, endTime: newEndTime };
        setUpdateDialogOpen(true);
      } else if (onEventUpdate) {
        onEventUpdate(id, newStartTime, newEndTime);
      }
    }
  });

  const [startHours, startMinutes] = visualStartTime.split(":").map(Number);
  const [endHours, endMinutes] = visualEndTime.split(":").map(Number);
  const durationInMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  const shouldWrapText = durationInMinutes >= 30;

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

    if (timeSinceMouseDown < 200 && dragDistance.current < 5 && !isDragging) {
      setFormOpen(true);
    }
  };

  const backgroundColor = sphere === 'google-calendar' 
    ? 'bg-blue-500 text-white' 
    : `bg-[var(--sphere-${sphere})]`;

  const cursor = isOwner ? (isDragging ? 'grabbing' : 'grab') : 'default';

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
        <EventContent 
          name={name}
          isRecurring={isRecurring}
          sphere={sphere}
          frequency={frequency}
          shouldWrapText={shouldWrapText}
        />
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
            onSave={(data) => {
              if (isRecurring || sphere === 'google-calendar') {
                pendingUpdate.current = { 
                  startTime: data.startTime, 
                  endTime: data.endTime 
                };
                setUpdateDialogOpen(true);
                setFormOpen(false);
              } else if (onEventUpdate) {
                onEventUpdate(id, data.startTime, data.endTime);
                setFormOpen(false);
              }
            }}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <EventUpdateDialog
        open={updateDialogOpen}
        onOpenChange={(open) => {
          if (!open && pendingUpdate.current) {
            pendingUpdate.current = null;
          }
          setUpdateDialogOpen(open);
        }}
        isRecurring={isRecurring || (sphere === 'google-calendar' && !!frequency)}
        hasInvitees={hasInvitees}
        onUpdate={(updateType, notifyInvitees) => {
          if (pendingUpdate.current && onEventUpdate) {
            onEventUpdate(
              id, 
              pendingUpdate.current.startTime, 
              pendingUpdate.current.endTime,
              updateType,
              notifyInvitees
            );
            pendingUpdate.current = null;
          }
          setUpdateDialogOpen(false);
        }}
      />
    </>
  );
};
