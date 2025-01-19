import { Card } from "@/components/ui/card";
import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EventDialog } from "./calendar/EventDialog";
import { EventUpdateDialog } from "./calendar/EventUpdateDialog";
import { calculateEventStyle, calculateNewTimes, calculateResizeTime } from "./calendar/EventDragLogic";
import { GripHorizontal } from "lucide-react";

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
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<'top' | 'bottom' | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const dragStartY = useRef<number>(0);
  const originalStartTime = useRef<string>(startTime);
  const originalEndTime = useRef<string>(endTime);
  const { toast } = useToast();

  const handleMouseDown = (e: React.MouseEvent, type?: 'top' | 'bottom') => {
    if (sphere === 'google-calendar' && !isOwner) return;
    
    if (type) {
      setIsResizing(type);
    } else {
      setIsDragging(true);
    }
    
    dragStartY.current = e.clientY;
    originalStartTime.current = startTime;
    originalEndTime.current = endTime;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging && !isResizing) return;
    
    const deltaY = e.clientY - dragStartY.current;
    
    if (isResizing) {
      const { newStartTime, newEndTime } = calculateResizeTime(
        originalStartTime.current,
        originalEndTime.current,
        deltaY,
        isResizing
      );
      
      if (onEventUpdate) {
        onEventUpdate(id, newStartTime, newEndTime);
      }
    } else if (isDragging) {
      const { newStartTime, newEndTime } = calculateNewTimes(
        originalStartTime.current,
        originalEndTime.current,
        deltaY
      );
      
      if (onEventUpdate) {
        onEventUpdate(id, newStartTime, newEndTime);
      }
    }
  };

  const handleMouseUp = async () => {
    if (!isDragging && !isResizing) return;
    
    if (isRecurring || hasInvitees) {
      setUpdateDialogOpen(true);
    } else {
      await updateEvent();
    }
    
    setIsDragging(false);
    setIsResizing(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const updateEvent = async (updateType: 'single' | 'series' = 'single', notifyInvitees: boolean = false) => {
    if (sphere === 'google-calendar' && !isOwner) return;

    try {
      // Validate UUID format
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) {
        throw new Error('Invalid UUID format');
      }

      const { error } = await supabase
        .from('scheduled_habits')
        .update({ 
          starttime: startTime, 
          endtime: endTime 
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Event updated",
        description: "The event time has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update the event time.",
        variant: "destructive",
      });
    }
    setUpdateDialogOpen(false);
  };

  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);
  const durationInMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  const shouldWrapText = durationInMinutes >= 30;

  const backgroundColor = sphere === 'google-calendar' 
    ? 'bg-blue-500 text-white' 
    : `bg-[var(--sphere-${sphere})]`;

  const cursor = isOwner ? (isDragging ? 'grabbing' : 'grab') : 'default';

  return (
    <>
      <Card
        className={`absolute left-0 right-0 mx-0.5 px-[0.5px] overflow-hidden z-20 ${backgroundColor} ${isDragging ? 'opacity-70' : ''}`}
        style={{
          ...calculateEventStyle(startTime, endTime, isDragging),
          cursor
        }}
        onMouseDown={(e) => !isOwner ? null : handleMouseDown(e)}
        onClick={() => setDialogOpen(true)}
      >
        {isOwner && (
          <>
            <div
              className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-black/10"
              onMouseDown={(e) => handleMouseDown(e, 'top')}
            >
              <GripHorizontal className="w-4 h-4 mx-auto" />
            </div>
            <div
              className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-black/10"
              onMouseDown={(e) => handleMouseDown(e, 'bottom')}
            >
              <GripHorizontal className="w-4 h-4 mx-auto" />
            </div>
          </>
        )}
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
          onUpdate={updateEvent}
        />
      )}
    </>
  );
}