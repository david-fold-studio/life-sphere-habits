import { useRef, useState } from "react";
import { calculateNewTimes, calculateResizeTime } from "./EventDragLogic";

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
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<'top' | 'bottom' | null>(null);
  const dragStartY = useRef<number>(0);
  const originalStartTime = useRef<string>(startTime);
  const originalEndTime = useRef<string>(endTime);
  const mouseMoveHandler = useRef<((e: MouseEvent) => void) | null>(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef<'top' | 'bottom' | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const THROTTLE_MS = 50; // Throttle updates to 50ms

  const handleMouseDown = (e: React.MouseEvent, type?: 'top' | 'bottom') => {
    if (!isOwner) {
      console.log('Not owner, ignoring mouse down');
      return;
    }

    e.preventDefault();
    
    // Clean up any existing handlers first
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
    } 
    else if (!isResizingRef.current) {
      setIsDragging(true);
      isDraggingRef.current = true;
    }
    
    dragStartY.current = e.clientY;
    originalStartTime.current = startTime;
    originalEndTime.current = endTime;
    lastUpdateTime.current = Date.now();

    const moveHandler = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastUpdateTime.current < THROTTLE_MS) {
        return; // Skip this update if we're within the throttle window
      }

      const deltaY = e.clientY - dragStartY.current;
      
      if (isResizingRef.current) {
        const { newStartTime, newEndTime } = calculateResizeTime(
          originalStartTime.current,
          originalEndTime.current,
          deltaY,
          isResizingRef.current
        );
        onEventUpdate(id, newStartTime, newEndTime);
      } 
      else if (isDraggingRef.current) {
        const { newStartTime, newEndTime } = calculateNewTimes(
          originalStartTime.current,
          originalEndTime.current,
          deltaY
        );
        onEventUpdate(id, newStartTime, newEndTime);
      }
      
      lastUpdateTime.current = now;
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
    
    isDraggingRef.current = false;
    isResizingRef.current = null;
    setIsDragging(false);
    setIsResizing(null);
  };

  return {
    isDragging,
    isResizing,
    handleMouseDown,
    handleMouseUp,
  };
};