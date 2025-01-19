import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddGoalFormProps {
  onSave: (goalTitle: string, targetDate: Date) => void;
  onCancel: () => void;
}

export function AddGoalForm({ onSave, onCancel }: AddGoalFormProps) {
  const [goalTitle, setGoalTitle] = useState("");
  const [date, setDate] = useState<Date>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalTitle && date) {
      onSave(goalTitle, date);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-white">
      <div className="space-y-2">
        <label htmlFor="goalTitle" className="text-sm font-medium">
          Goal Title
        </label>
        <Input
          id="goalTitle"
          value={goalTitle}
          onChange={(e) => setGoalTitle(e.target.value)}
          placeholder="Enter goal title"
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Target Date</label>
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
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!goalTitle || !date}
        >
          <Check className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </form>
  );
}