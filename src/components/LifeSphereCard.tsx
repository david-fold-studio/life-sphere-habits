import { Card, CardContent } from "@/components/ui/card";
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
        {/* Main container with flexible column layout */}
        <div className="flex flex-col gap-6">
          {/* Sphere Info - Full width on mobile, row on tablet, 1/3 width on desktop */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between lg:flex-col lg:items-start lg:w-1/3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-2">{icon}</div>
              <h3 className="font-semibold">{title}</h3>
            </div>
            {/* Mobile: Icon button */}
            <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden self-end">
              <Plus className="h-4 w-4" />
            </Button>
            {/* Tablet: Text button */}
            <Button variant="ghost" size="sm" className="hidden md:inline-flex lg:hidden">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
            {/* Desktop: Text button */}
            <Button variant="ghost" size="sm" className="hidden lg:inline-flex w-full mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>

          {/* Goals Grid Container - 1 column on mobile, 2 on tablet, 2 on desktop (in remaining 2/3 space) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:w-2/3">
            {/* First Goal */}
            {goals[0] && (
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
                    <h4 className="font-medium">{goals[0].name}</h4>
                    <span className="text-xs text-muted-foreground">
                      Due {format(new Date(goals[0].targetDate), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex-grow">
                    {goals[0].habits.length > 0 && (
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
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Second Goal */}
            {goals[1] && (
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
                    <h4 className="font-medium">{goals[1].name}</h4>
                    <span className="text-xs text-muted-foreground">
                      Due {format(new Date(goals[1].targetDate), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex-grow">
                    {goals[1].habits.length > 0 && (
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