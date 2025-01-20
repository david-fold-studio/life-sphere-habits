import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EventEditFormProps {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  date: Date;
  isRecurring?: boolean;
  frequency?: string;
  invitees?: string[];
  onSave: (data: {
    startTime: string;
    endTime: string;
    date: Date;
    isRecurring: boolean;
    frequency?: string;
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">{name}</h2>
      
      <Card className="bg-blue-50/50 mb-6">
        <CardContent className="p-4">
          <div className="text-lg">
            Time: {format(date, "EEEE, MMMM d")}
          </div>
          <div className="text-lg mt-1">
            {selectedStartTime} - {selectedEndTime}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-semibold">Date</Label>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && setDate(newDate)}
            className="rounded-md border"
          />
        </div>

        <div className="space-y-4">
          <Label className="text-base font-semibold">Time</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start</Label>
              <Input
                type="time"
                value={selectedStartTime}
                onChange={(e) => setSelectedStartTime(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>End</Label>
              <Input
                type="time"
                value={selectedEndTime}
                onChange={(e) => setSelectedEndTime(e.target.value)}
                className="w-full"
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