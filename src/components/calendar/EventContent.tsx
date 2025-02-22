
import React from "react";

interface EventContentProps {
  name: string;
  isRecurring?: boolean;
  sphere: string;
  frequency?: string | null;
  shouldWrapText: boolean;
}

export const EventContent = ({ 
  name, 
  isRecurring, 
  sphere, 
  frequency, 
  shouldWrapText 
}: EventContentProps) => {
  return (
    <div className={`text-[10px] leading-[0.85] font-medium ${shouldWrapText ? 'whitespace-normal' : 'truncate'}`}>
      {name}
      {(isRecurring || (sphere === 'google-calendar' && frequency)) && <span className="ml-1">🔄</span>}
    </div>
  );
};
