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

    // Prevent text selection during drag
    e.preventDefault();
    
    if (type) {
      console.log('🔄 Starting resize operation:', type);
      setIsResizing(type);
    } else {
      console.log('✋ Starting drag operation');
      setIsDragging(true);
    }
    
    dragStartY.current = e.clientY;
    originalStartTime.current = startTime;
    originalEndTime.current = endTime;
    
    console.log('📌 Initial position and times:', {
      dragStartY: dragStartY.current,
      originalStartTime: originalStartTime.current,
      originalEndTime: originalEndTime.current
    });

    // Create mousemove handler before adding the listener
    const moveHandler = (e: MouseEvent) => {
      // Check state directly from refs to avoid closure issues
      if (!isDragging && !isResizing) {
        console.log('⏭️ Mouse move ignored - not dragging or resizing');
        return;
      }
      
      const deltaY = e.clientY - dragStartY.current;
      console.log('📏 Mouse move delta:', deltaY);
      
      if (isResizing) {
        console.log('🔄 Resizing event:', { id, isResizing, sphere });
        const { newStartTime, newEndTime } = calculateResizeTime(
          originalStartTime.current,
          originalEndTime.current,
          deltaY,
          isResizing
        );
        onEventUpdate(id, newStartTime, newEndTime);
      } else {
        console.log('🚀 Dragging event:', { id, sphere });
        const { newStartTime, newEndTime } = calculateNewTimes(
          originalStartTime.current,
          originalEndTime.current,
          deltaY
        );
        onEventUpdate(id, newStartTime, newEndTime);
      }
    };

    // Store the handler reference
    mouseMoveHandler.current = moveHandler;
    
    // Add the event listeners
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseUp = () => {
    console.log('👆 Mouse up event - ending drag/resize', {
      wasDragging: isDragging,
      wasResizing: isResizing
    });
    
    // Remove event listeners using the stored handler
    if (mouseMoveHandler.current) {
      document.removeEventListener('mousemove', mouseMoveHandler.current);
      mouseMoveHandler.current = null;
    }
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Reset states after cleanup
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