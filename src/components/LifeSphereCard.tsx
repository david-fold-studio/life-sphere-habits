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
  const borderColorClass = className?.split(' ').find(cls => cls.startsWith('border-')) || '';

  return (
    <Card className={cn("transition-all hover:shadow-lg border-2", className)}>
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Column 1: Sphere Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-2">{icon}</div>
              <h3 className="font-semibold">{title}</h3>
            </div>
            <Button variant="ghost" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>

          {/* Column 2: First Goal */}
          <div>
            {goals[0] && (
              <div 
                className={cn(
                  "rounded-lg border bg-white p-4 shadow-sm h-full",
                  borderColorClass
                )}
              >
                <div className="flex flex-col h-full">
                  <div className="mb-3">
                    <h4 className="font-medium">{goals[0].name}</h4>
                    <span className="text-xs text-muted-foreground">
                      Due {format(new Date(goals[0].targetDate), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex-grow">
                    {goals[0].habits.length > 0 ? (
                      <ul className="space-y-2">
                        {goals[0].habits.map((habit) => (
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
                    ) : (
                      <Button variant="outline" size="sm" className="w-full">
                        Add a Habit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Second Goal */}
          <div>
            {goals[1] && (
              <div 
                className={cn(
                  "rounded-lg border bg-white p-4 shadow-sm h-full",
                  borderColorClass
                )}
              >
                <div className="flex flex-col h-full">
                  <div className="mb-3">
                    <h4 className="font-medium">{goals[1].name}</h4>
                    <span className="text-xs text-muted-foreground">
                      Due {format(new Date(goals[1].targetDate), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex-grow">
                    {goals[1].habits.length > 0 ? (
                      <ul className="space-y-2">
                        {goals[1].habits.map((habit) => (
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
                    ) : (
                      <Button variant="outline" size="sm" className="w-full">
                        Add a Habit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}