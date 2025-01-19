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

  const handleMouseDown = (e: React.MouseEvent, type?: 'top' | 'bottom') => {
    console.log('🔵 Mouse down event triggered:', { 
      id, 
      type, 
      isOwner, 
      sphere,
      clientY: e.clientY,
    });
    
    if (!isOwner) {
      console.log('❌ Not owner, ignoring mouse down');
      return;
    }

    e.preventDefault();
    
    if (type) {
      console.log('🔄 Starting resize operation:', type);
      e.stopPropagation();
      setIsResizing(type);
      isResizingRef.current = type;
      setIsDragging(false);
      isDraggingRef.current = false;
      dragStartY.current = e.clientY;
    } 
    else if (!isResizingRef.current) {
      console.log('✋ Starting drag operation');
      setIsDragging(true);
      isDraggingRef.current = true;
      dragStartY.current = e.clientY;
    }
    
    originalStartTime.current = startTime;
    originalEndTime.current = endTime;
    
    console.log('📌 Initial position and times:', {
      dragStartY: dragStartY.current,
      originalStartTime: originalStartTime.current,
      originalEndTime: originalEndTime.current,
      isDragging: isDraggingRef.current,
      isResizing: isResizingRef.current
    });

    const moveHandler = (e: MouseEvent) => {
      const deltaY = e.clientY - dragStartY.current;
      console.log('Mouse move:', { 
        deltaY, 
        isDragging: isDraggingRef.current, 
        isResizing: isResizingRef.current 
      });
      
      if (isResizingRef.current) {
        console.log('🔄 Resizing event:', { id, isResizing: isResizingRef.current, deltaY });
        const { newStartTime, newEndTime } = calculateResizeTime(
          originalStartTime.current,
          originalEndTime.current,
          deltaY,
          isResizingRef.current
        );
        onEventUpdate(id, newStartTime, newEndTime);
      } 
      else if (isDraggingRef.current) {
        console.log('🚀 Dragging event:', { id, deltaY });
        const { newStartTime, newEndTime } = calculateNewTimes(
          originalStartTime.current,
          originalEndTime.current,
          deltaY
        );
        onEventUpdate(id, newStartTime, newEndTime);
      }
    };

    mouseMoveHandler.current = moveHandler;
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseUp = () => {
    console.log('👆 Mouse up event - ending drag/resize', {
      wasDragging: isDraggingRef.current,
      wasResizing: isResizingRef.current
    });
    
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