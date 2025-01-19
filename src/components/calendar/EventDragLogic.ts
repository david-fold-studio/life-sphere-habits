export const calculateEventStyle = (startTime: string, endTime: string, isDragging: boolean) => {
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
  };
};

const snapToNearestFifteen = (minutes: number): number => {
  return Math.round(minutes / 15) * 15;
};

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

export const calculateNewTimes = (
  originalStartTime: string,
  originalEndTime: string,
  deltaY: number
) => {
  // Convert deltaY to minutes (48px = 60 minutes)
  const deltaMinutes = Math.round((deltaY / 48) * 60);
  
  const [startHours, startMinutes] = originalStartTime.split(":").map(Number);
  const [endHours, endMinutes] = originalEndTime.split(":").map(Number);
  
  let newStartMinutes = startHours * 60 + startMinutes + deltaMinutes;
  let newEndMinutes = endHours * 60 + endMinutes + deltaMinutes;
  
  // Snap both times to nearest 15 minutes
  newStartMinutes = snapToNearestFifteen(newStartMinutes);
  newEndMinutes = snapToNearestFifteen(newEndMinutes);
  
  // Ensure times stay within bounds
  if (newStartMinutes < 0) {
    const diff = -newStartMinutes;
    newStartMinutes = 0;
    newEndMinutes = Math.min(24 * 60 - 1, newEndMinutes - diff);
  } else if (newEndMinutes >= 24 * 60) {
    const diff = newEndMinutes - (24 * 60 - 1);
    newEndMinutes = 24 * 60 - 1;
    newStartMinutes = Math.max(0, newStartMinutes - diff);
  }
  
  return {
    newStartTime: formatTime(newStartMinutes),
    newEndTime: formatTime(newEndMinutes)
  };
};

export const calculateResizeTime = (
  originalStartTime: string,
  originalEndTime: string,
  deltaY: number,
  resizeType: 'top' | 'bottom'
) => {
  const deltaMinutes = Math.round((deltaY / 48) * 60);
  
  const [startHours, startMinutes] = originalStartTime.split(":").map(Number);
  const [endHours, endMinutes] = originalEndTime.split(":").map(Number);
  let newStartMinutes = startHours * 60 + startMinutes;
  let newEndMinutes = endHours * 60 + endMinutes;
  
  if (resizeType === 'top') {
    newStartMinutes = snapToNearestFifteen(newStartMinutes + deltaMinutes);
    if (newStartMinutes < 0) newStartMinutes = 0;
    if (newStartMinutes >= newEndMinutes - 15) newStartMinutes = newEndMinutes - 15;
  } else {
    newEndMinutes = snapToNearestFifteen(newEndMinutes + deltaMinutes);
    if (newEndMinutes >= 24 * 60) newEndMinutes = 24 * 60 - 1;
    if (newEndMinutes <= newStartMinutes + 15) newEndMinutes = newStartMinutes + 15;
  }
  
  return {
    newStartTime: formatTime(newStartMinutes),
    newEndTime: formatTime(newEndMinutes)
  };
};