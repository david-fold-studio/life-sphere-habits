import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Habit {
  id: string;
  name: string;
  frequency?: string;
}

interface GoalCardProps {
  name: string;
  targetDate: string;
  habits: Habit[];
  borderColorClass: string;
}

export function GoalCard({ name, targetDate, habits, borderColorClass }: GoalCardProps) {
  return (
    <div 
      className={cn(
        "rounded-lg border bg-white p-4 shadow-sm h-full relative",
        borderColorClass
      )}
    >
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 h-6 w-6"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <div className="flex flex-col h-full">
        <div className="mb-3">
          <h4 className="font-medium">{name}</h4>
          <span className="text-xs text-muted-foreground">
            Due {format(new Date(targetDate), "MMM d, yyyy")}
          </span>
        </div>
        <div className="flex-grow">
          {habits.length > 0 && (
            <ul className="space-y-2">
              {habits.map((habit) => (
                <li
                  key={habit.id}
                  className="flex items-center justify-between rounded-lg bg-white/80 p-2 text-sm border border-muted"
                >
                  <span>{habit.name}</span>
                  {habit.frequency ? (
                    <span className="text-xs text-muted-foreground">{habit.frequency}</span>
                  ) : (
                    <Button variant="secondary" size="sm" className="h-6 px-2 text-xs">Schedule</Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}