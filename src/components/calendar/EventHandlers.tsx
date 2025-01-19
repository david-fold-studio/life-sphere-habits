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

  const handleMouseDown = (e: React.MouseEvent, type?: 'top' | 'bottom') => {
    console.log('Mouse down event triggered:', { id, type, isOwner, sphere });
    
    if (!isOwner) {
      console.log('Not owner, ignoring mouse down');
      return;
    }
    
    if (type) {
      console.log('Starting resize operation:', type);
      setIsResizing(type);
    } else {
      console.log('Starting drag operation');
      setIsDragging(true);
    }
    
    dragStartY.current = e.clientY;
    originalStartTime.current = startTime;
    originalEndTime.current = endTime;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Prevent text selection during drag
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging && !isResizing) {
      console.log('Mouse move ignored - not dragging or resizing');
      return;
    }
    
    const deltaY = e.clientY - dragStartY.current;
    console.log('Mouse move delta:', deltaY);
    
    if (isResizing) {
      console.log('Resizing event:', { id, isResizing, sphere });
      const { newStartTime, newEndTime } = calculateResizeTime(
        originalStartTime.current,
        originalEndTime.current,
        deltaY,
        isResizing
      );
      
      console.log('New times after resize:', { newStartTime, newEndTime });
      onEventUpdate(id, newStartTime, newEndTime);
    } else if (isDragging) {
      console.log('Dragging event:', { id, sphere });
      const { newStartTime, newEndTime } = calculateNewTimes(
        originalStartTime.current,
        originalEndTime.current,
        deltaY
      );
      
      console.log('New times after drag:', { newStartTime, newEndTime });
      onEventUpdate(id, newStartTime, newEndTime);
    }
  };

  const handleMouseUp = () => {
    console.log('Mouse up event - ending drag/resize');
    setIsDragging(false);
    setIsResizing(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return {
    isDragging,
    isResizing,
    handleMouseDown,
    handleMouseUp,
  };
};