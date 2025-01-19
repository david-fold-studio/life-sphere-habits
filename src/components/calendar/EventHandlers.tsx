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
      
      onEventUpdate(id, newStartTime, newEndTime);
    } else if (isDragging) {
      const { newStartTime, newEndTime } = calculateNewTimes(
        originalStartTime.current,
        originalEndTime.current,
        deltaY
      );
      
      onEventUpdate(id, newStartTime, newEndTime);
    }
  };

  const handleMouseUp = () => {
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