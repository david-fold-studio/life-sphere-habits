import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface EventEditFormProps {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  date: Date;
  isRecurring?: boolean;
  invitees?: string[];
  onSave: (data: {
    startTime: string;
    endTime: string;
    date: Date;
    isRecurring: boolean;
    invitees: string[];
  }) => void;
  onCancel: () => void;
}

export function EventEditForm({
  name,
  startTime,
  endTime,
  date: initialDate,
  onSave,
  onCancel,
}: EventEditFormProps) {
  const [date, setDate] = useState<Date>(initialDate);
  const [selectedStartTime, setSelectedStartTime] = useState(startTime);
  const [selectedEndTime, setSelectedEndTime] = useState(endTime);

  const handleSave = () => {
    onSave({
      startTime: selectedStartTime,
      endTime: selectedEndTime,
      date,
      isRecurring: false,
      invitees: [],
    });
  };

  const focusTimeInput = (inputId: string) => {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.showPicker();
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">{name}</h2>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-semibold">When</Label>
          <div className="grid grid-cols-3 gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  {date ? format(date, "EEE, MMM d") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <div className="relative">
              <Input
                id="start-time"
                type="time"
                value={selectedStartTime}
                onChange={(e) => setSelectedStartTime(e.target.value)}
                className="w-full pr-8 [&::-webkit-calendar-picker-indicator]:hidden"
              />
              <ChevronDown 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 cursor-pointer" 
                onClick={() => focusTimeInput('start-time')}
              />
            </div>

            <div className="relative">
              <Input
                id="end-time"
                type="time"
                value={selectedEndTime}
                onChange={(e) => setSelectedEndTime(e.target.value)}
                className="w-full pr-8 [&::-webkit-calendar-picker-indicator]:hidden"
              />
              <ChevronDown 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 cursor-pointer" 
                onClick={() => focusTimeInput('end-time')}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
}