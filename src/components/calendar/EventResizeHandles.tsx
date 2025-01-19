import { GripHorizontal } from "lucide-react";

interface EventResizeHandlesProps {
  onMouseDown: (e: React.MouseEvent, type: 'top' | 'bottom') => void;
}

export function EventResizeHandles({ onMouseDown }: EventResizeHandlesProps) {
  return (
    <>
      <div
        className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-black/10"
        onMouseDown={(e) => onMouseDown(e, 'top')}
      >
        <GripHorizontal className="w-4 h-4 mx-auto" />
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-black/10"
        onMouseDown={(e) => onMouseDown(e, 'bottom')}
      >
        <GripHorizontal className="w-4 h-4 mx-auto" />
      </div>
    </>
  );
}