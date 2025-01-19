import { useRef, useState } from "react";
import { calculateNewTimes, calculateResizeTime } from "./EventDragLogic";
import { useToast } from "@/hooks/use-toast";

interface UseEventHandlersProps {
  id: string;
  startTime: string;
  endTime: string;
  sphere: string;
  isOwner: boolean;
  day: number;
  onEventUpdate: (id: string, startTime: string, endTime: string) => void;
  onDayChange?: (id: string, newDay: number) => void;
}

export const useEventHandlers = ({
  id,
  startTime,
  endTime,
  sphere,
  isOwner,
  day,
  onEventUpdate,
  onDayChange,
}: UseEventHandlersProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<'top' | 'bottom' | null>(null);
  const dragStartY = useRef<number>(0);
  const dragStartX = useRef<number>(0);
  const originalStartTime = useRef<string>(startTime);
  const originalEndTime = useRef<string>(endTime);
  const originalDay = useRef<number>(day);
  const mouseMoveHandler = useRef<((e: MouseEvent) => void) | null>(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef<'top' | 'bottom' | null>(null);
  const currentDeltaY = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent, type?: 'top' | 'bottom') => {
    if (!isOwner) return;

    e.preventDefault();
    
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
    dragStartX.current = e.clientX;
    originalStartTime.current = startTime;
    originalEndTime.current = endTime;
    originalDay.current = day;
    currentDeltaY.current = 0;

    const moveHandler = (e: MouseEvent) => {
      currentDeltaY.current = e.clientY - dragStartY.current;
      const deltaX = e.clientX - dragStartX.current;
      
      // Calculate day change based on horizontal movement
      // Assuming each day column is roughly 200px wide
      const dayChange = Math.round(deltaX / 200);
      const newDay = Math.min(Math.max(0, originalDay.current + dayChange), 6);
      
      if (isResizingRef.current) {
        const { newStartTime, newEndTime } = calculateResizeTime(
          originalStartTime.current,
          originalEndTime.current,
          currentDeltaY.current,
          isResizingRef.current
        );
        document.dispatchEvent(new CustomEvent('visualTimeUpdate', {
          detail: { id, newStartTime, newEndTime, newDay }
        }));
      } else if (isDraggingRef.current) {
        const { newStartTime, newEndTime } = calculateNewTimes(
          originalStartTime.current,
          originalEndTime.current,
          currentDeltaY.current
        );
        document.dispatchEvent(new CustomEvent('visualTimeUpdate', {
          detail: { id, newStartTime, newEndTime, newDay }
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