import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Plus } from "lucide-react";

interface Habit {
  id: string;
  name: string;
  frequency?: string;
}

interface Goal {
  id: string;
  name: string;
  targetDate: string;
  habits: Habit[];
}

interface LifeSphereCardProps {
  title: string;
  icon: React.ReactNode;
  goals: Goal[];
  className?: string;
}

export function LifeSphereCard({ title, icon, goals, className }: LifeSphereCardProps) {
  return (
    <Card className={cn("h-full transition-all hover:shadow-lg border-2", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-white p-2">{icon}</div>
          <h3 className="font-semibold">{title}</h3>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add Goal</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{goal.name}</h4>
                <span className="text-xs text-muted-foreground">
                  Due {format(new Date(goal.targetDate), "MMM d, yyyy")}
                </span>
              </div>
              {goal.habits.length > 0 ? (
                <ul className="space-y-2">
                  {goal.habits.map((habit) => (
                    <li
                      key={habit.id}
                      className="flex items-center justify-between rounded-lg bg-white/80 p-2 text-sm"
                    >
                      <span>{habit.name}</span>
                      {habit.frequency ? (
                        <span className="text-xs text-muted-foreground">{habit.frequency}</span>
                      ) : (
                        <Button variant="secondary" size="sm">
                          Schedule
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <Button variant="outline" size="sm" className="w-full">
                  Add a Habit
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}