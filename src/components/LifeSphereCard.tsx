import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
          {/* Sphere Info - Full width */}
          <div className="flex md:flex-col items-center md:items-start justify-between md:space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-2">{icon}</div>
              <h3 className="font-semibold">{title}</h3>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hidden md:inline-flex w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>

          {/* Goals Grid Container - 2 columns on tablet, 1 on mobile, 3 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* First Goal */}
            <div>
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
            </div>

            {/* Second Goal */}
            <div>
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
        </div>
      </CardContent>
    </Card>
  );
}