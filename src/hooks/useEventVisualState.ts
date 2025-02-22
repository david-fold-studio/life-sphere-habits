
import { useState, useEffect } from "react";

interface UseEventVisualStateProps {
  startTime: string;
  endTime: string;
  day: number;
  id: string;
}

export const useEventVisualState = ({ startTime, endTime, day, id }: UseEventVisualStateProps) => {
  const [visualStartTime, setVisualStartTime] = useState(startTime);
  const [visualEndTime, setVisualEndTime] = useState(endTime);
  const [visualDay, setVisualDay] = useState(day);

  // Reset visual state when props change
  useEffect(() => {
    setVisualStartTime(startTime);
    setVisualEndTime(endTime);
    setVisualDay(day);
  }, [startTime, endTime, day]);

  useEffect(() => {
    const handleVisualUpdate = (e: CustomEvent<{ 
      id: string; 
      newStartTime: string; 
      newEndTime: string;
      newDay: number;
    }>) => {
      if (e.detail.id === id) {
        setVisualStartTime(e.detail.newStartTime);
        setVisualEndTime(e.detail.newEndTime);
        setVisualDay(e.detail.newDay);
      }
    };

    document.addEventListener('visualTimeUpdate', handleVisualUpdate as EventListener);
    return () => {
      document.removeEventListener('visualTimeUpdate', handleVisualUpdate as EventListener);
    };
  }, [id]);

  return {
    visualStartTime,
    visualEndTime,
    visualDay,
    setVisualStartTime,
    setVisualEndTime,
    setVisualDay
  };
};
