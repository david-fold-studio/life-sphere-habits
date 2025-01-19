import { Card } from "@/components/ui/card";
import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EventDialog } from "./calendar/EventDialog";
import { calculateEventStyle, calculateNewTimes } from "./calendar/EventDragLogic";

interface CalendarEventProps {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  sphere: string;
  onEventUpdate?: (id: string, startTime: string, endTime: string) => void;
  onEventDelete?: (id: string) => void;
}

export function CalendarEvent({ 
  id, 
  name, 
  startTime, 
  endTime, 
  sphere,
  onEventUpdate,
  onEventDelete 
}: CalendarEventProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const dragStartY = useRef<number>(0);
  const originalStartTime = useRef<string>(startTime);
  const originalEndTime = useRef<string>(endTime);
  const { toast } = useToast();

  const handleMouseDown = (e: React.MouseEvent) => {
    if (sphere === 'google-calendar') return;
    setIsDragging(true);
    dragStartY.current = e.clientY;
    originalStartTime.current = startTime;
    originalEndTime.current = endTime;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaY = e.clientY - dragStartY.current;
    const { newStartTime, newEndTime } = calculateNewTimes(
      originalStartTime.current,
      originalEndTime.current,
      deltaY
    );
    
    if (onEventUpdate) {
      onEventUpdate(id, newStartTime, newEndTime);
    }
  };

  const handleMouseUp = async () => {
    if (!isDragging) return;
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    if (sphere !== 'google-calendar') {
      try {
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
    }
  };

  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);
  const durationInMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  const shouldWrapText = durationInMinutes >= 30;

  const backgroundColor = sphere === 'google-calendar' 
    ? 'bg-blue-500 text-white' 
    : `bg-[var(--sphere-${sphere})]`;

  return (
    <>
      <Card
        className={`absolute left-0 right-0 mx-0.5 px-[0.5px] overflow-hidden z-20 ${backgroundColor} ${isDragging ? 'opacity-70' : ''}`}
        style={calculateEventStyle(startTime, endTime, isDragging)}
        onMouseDown={handleMouseDown}
        onClick={() => setDialogOpen(true)}
      >
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
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onDelete={onEventDelete}
      />
    </>
  );
}