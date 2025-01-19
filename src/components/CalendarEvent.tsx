import { Card } from "@/components/ui/card";
import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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

  const getEventStyle = (startTime: string, endTime: string) => {
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);
    
    const startInMinutes = startHours * 60 + startMinutes;
    const endInMinutes = endHours * 60 + endMinutes;
    const durationInMinutes = endInMinutes - startInMinutes;
    const height = durationInMinutes * (48 / 60);
    const top = startInMinutes * (48 / 60);

    return {
      top: `${top}px`,
      height: `${height}px`,
      cursor: isDragging ? 'grabbing' : 'grab'
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (sphere === 'google-calendar') return; // Prevent dragging Google Calendar events
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
    const deltaMinutes = Math.round((deltaY / 48) * 60); // 48px per hour
    
    // Convert times to minutes
    const [startHours, startMinutes] = originalStartTime.current.split(":").map(Number);
    const [endHours, endMinutes] = originalEndTime.current.split(":").map(Number);
    let newStartMinutes = startHours * 60 + startMinutes + deltaMinutes;
    let newEndMinutes = endHours * 60 + endMinutes + deltaMinutes;
    
    // Ensure times stay within 24-hour bounds
    if (newStartMinutes < 0) {
      const diff = -newStartMinutes;
      newStartMinutes = 0;
      newEndMinutes = Math.min(24 * 60 - 1, newEndMinutes - diff);
    } else if (newEndMinutes >= 24 * 60) {
      const diff = newEndMinutes - (24 * 60 - 1);
      newEndMinutes = 24 * 60 - 1;
      newStartMinutes = Math.max(0, newStartMinutes - diff);
    }
    
    // Convert back to HH:mm format
    const newStartTime = `${String(Math.floor(newStartMinutes / 60)).padStart(2, '0')}:${String(newStartMinutes % 60).padStart(2, '0')}`;
    const newEndTime = `${String(Math.floor(newEndMinutes / 60)).padStart(2, '0')}:${String(newEndMinutes % 60).padStart(2, '0')}`;
    
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

  const handleDelete = async () => {
    if (sphere === 'google-calendar') {
      toast({
        title: "Cannot delete",
        description: "Google Calendar events cannot be deleted from this interface.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('scheduled_habits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (onEventDelete) {
        onEventDelete(id);
      }

      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete the event.",
        variant: "destructive",
      });
    }
    setDialogOpen(false);
  };

  // Calculate if event is long enough to show wrapped text (more than 30 minutes)
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
        key={id}
        className={`absolute left-0 right-0 mx-0.5 px-[0.5px] overflow-hidden z-20 ${backgroundColor} ${isDragging ? 'opacity-70' : ''}`}
        style={getEventStyle(startTime, endTime)}
        onMouseDown={handleMouseDown}
        onClick={() => setDialogOpen(true)}
      >
        <div className={`text-[10px] leading-[0.85] font-medium ${shouldWrapText ? 'whitespace-normal' : 'truncate'}`}>
          {name}
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">Time: {startTime} - {endTime}</p>
            {sphere !== 'google-calendar' && (
              <p className="text-sm text-muted-foreground mt-2">
                Tip: You can drag the event to change its time.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
            {sphere !== 'google-calendar' && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
