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

    // Always prevent default to stop text selection
    e.preventDefault();
    
    // If this is a resize operation (type is provided)
    if (type) {
      console.log('🔄 Starting resize operation:', type);
      // Stop event from reaching the card's onClick handler
      e.stopPropagation();
      setIsResizing(type);
      // Important: We're resizing, so make sure we're not dragging
      setIsDragging(false);
      dragStartY.current = e.clientY;
    } 
    // If this is a drag operation (no type provided and not already resizing)
    else if (!type && !isResizing) {
      console.log('✋ Starting drag operation');
      setIsDragging(true);
      dragStartY.current = e.clientY;
    } else {
      console.log('⚠️ Invalid operation state:', { type, isResizing });
      return;
    }
    
    originalStartTime.current = startTime;
    originalEndTime.current = endTime;
    
    console.log('📌 Initial position and times:', {
      dragStartY: dragStartY.current,
      originalStartTime: originalStartTime.current,
      originalEndTime: originalEndTime.current
    });

    // Create mousemove handler
    const moveHandler = (e: MouseEvent) => {
      const deltaY = e.clientY - dragStartY.current;
      
      // Handle resize operation
      if (isResizing) {
        console.log('🔄 Resizing event:', { id, isResizing, deltaY });
        const { newStartTime, newEndTime } = calculateResizeTime(
          originalStartTime.current,
          originalEndTime.current,
          deltaY,
          isResizing
        );
        onEventUpdate(id, newStartTime, newEndTime);
      } 
      // Handle drag operation
      else if (isDragging) {
        console.log('🚀 Dragging event:', { id, deltaY });
        const { newStartTime, newEndTime } = calculateNewTimes(
          originalStartTime.current,
          originalEndTime.current,
          deltaY
        );
        onEventUpdate(id, newStartTime, newEndTime);
      }
    };

    // Store the handler reference and add listeners
    mouseMoveHandler.current = moveHandler;
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseUp = () => {
    console.log('👆 Mouse up event - ending drag/resize', {
      wasDragging: isDragging,
      wasResizing: isResizing
    });
    
    // Remove event listeners
    if (mouseMoveHandler.current) {
      document.removeEventListener('mousemove', mouseMoveHandler.current);
      mouseMoveHandler.current = null;
    }
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Reset states
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