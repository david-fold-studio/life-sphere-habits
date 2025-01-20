import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

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
  startTime,
  endTime,
  date: initialDate,
  isRecurring: initialIsRecurring = false,
  frequency: initialFrequency,
  invitees: initialInvitees = [],
  onSave,
  onCancel,
}: EventEditFormProps) {
  const [date, setDate] = useState<Date>(initialDate);
  const [selectedStartTime, setSelectedStartTime] = useState(startTime);
  const [selectedEndTime, setSelectedEndTime] = useState(endTime);
  const [isRecurring, setIsRecurring] = useState(initialIsRecurring);
  const [frequency, setFrequency] = useState(initialFrequency || "weekly");
  const [inviteesInput, setInviteesInput] = useState(initialInvitees.join(", "));

  const handleSave = () => {
    const invitees = inviteesInput
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email !== "");

    onSave({
      startTime: selectedStartTime,
      endTime: selectedEndTime,
      date,
      isRecurring,
      frequency: isRecurring ? frequency : undefined,
      invitees,
    });
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Time</Label>
          <Input
            type="time"
            value={selectedStartTime}
            onChange={(e) => setSelectedStartTime(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>End Time</Label>
          <Input
            type="time"
            value={selectedEndTime}
            onChange={(e) => setSelectedEndTime(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="recurring"
          checked={isRecurring}
          onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
        />
        <Label htmlFor="recurring">Recurring Event</Label>
      </div>

      {isRecurring && (
        <div className="space-y-2">
          <Label>Frequency</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Invitees (comma-separated emails)</Label>
        <Input
          type="text"
          value={inviteesInput}
          onChange={(e) => setInviteesInput(e.target.value)}
          placeholder="email1@example.com, email2@example.com"
        />
      </div>

      <div className="flex justify-end space-x-2">
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