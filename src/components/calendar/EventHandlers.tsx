import { useRef, useState } from "react";
import { calculateNewTimes, calculateResizeTime } from "./EventDragLogic";
import { useToast } from "@/hooks/use-toast";

interface UseEventHandlersProps {
  id: string;
  startTime: string;
  endTime: string;
  sphere: string;
  isOwner: boolean;
  onEventUpdate: (id: string, startTime: string, endTime: string) => void;
}

export const useEventHandlers = ({
  id,
  startTime,
  endTime,
  sphere,
  isOwner,
  onEventUpdate,
}: UseEventHandlersProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<'top' | 'bottom' | null>(null);
  const dragStartY = useRef<number>(0);
  const originalStartTime = useRef<string>(startTime);
  const originalEndTime = useRef<string>(endTime);
  const mouseMoveHandler = useRef<((e: MouseEvent) => void) | null>(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef<'top' | 'bottom' | null>(null);
  const currentDeltaY = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent, type?: 'top' | 'bottom') => {
    if (!isOwner) return;

    e.preventDefault();
    
    // Clean up any existing handlers
    if (mouseMoveHandler.current) {
      document.removeEventListener('mousemove', mouseMoveHandler.current);
      mouseMoveHandler.current = null;
    }
    
    if (type) {
      e.stopPropagation();
      setIsResizing(type);
      isResizingRef.current = type;
      setIsDragging(false);
      isDraggingRef.current = false;
    } else {
      setIsDragging(true);
      isDraggingRef.current = true;
      setIsResizing(null);
      isResizingRef.current = null;
    }
    
    dragStartY.current = e.clientY;
    originalStartTime.current = startTime;
    originalEndTime.current = endTime;
    currentDeltaY.current = 0;

    const moveHandler = (e: MouseEvent) => {
      currentDeltaY.current = e.clientY - dragStartY.current;
      
      // Visual update without sending to server
      if (isResizingRef.current) {
        const { newStartTime, newEndTime } = calculateResizeTime(
          originalStartTime.current,
          originalEndTime.current,
          currentDeltaY.current,
          isResizingRef.current
        );
        // Update visual position only
        document.dispatchEvent(new CustomEvent('visualTimeUpdate', {
          detail: { id, newStartTime, newEndTime }
        }));
      } else if (isDraggingRef.current) {
        const { newStartTime, newEndTime } = calculateNewTimes(
          originalStartTime.current,
          originalEndTime.current,
          currentDeltaY.current
        );
        // Update visual position only
        document.dispatchEvent(new CustomEvent('visualTimeUpdate', {
          detail: { id, newStartTime, newEndTime }
        }));
      }
    };

    mouseMoveHandler.current = moveHandler;
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseUp = () => {
    if (mouseMoveHandler.current) {
      document.removeEventListener('mousemove', mouseMoveHandler.current);
      mouseMoveHandler.current = null;
    }
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Only update the server when the mouse is released
    if (currentDeltaY.current !== 0) {
      try {
        if (isResizingRef.current) {
          const { newStartTime, newEndTime } = calculateResizeTime(
            originalStartTime.current,
            originalEndTime.current,
            currentDeltaY.current,
            isResizingRef.current
          );
          onEventUpdate(id, newStartTime, newEndTime);
        } else if (isDraggingRef.current) {
          const { newStartTime, newEndTime } = calculateNewTimes(
            originalStartTime.current,
            originalEndTime.current,
            currentDeltaY.current
          );
          onEventUpdate(id, newStartTime, newEndTime);
        }
      } catch (error) {
        console.error('Error updating event:', error);
        toast({
          title: "Error",
          description: "Failed to update the event. Please try again.",
          variant: "destructive",
        });
      }
    }
    
    isDraggingRef.current = false;
    isResizingRef.current = null;
    setIsDragging(false);
    setIsResizing(null);
    currentDeltaY.current = 0;
  };

  return {
    isDragging,
    isResizing,
    handleMouseDown,
    handleMouseUp,
  };
};