import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Habit {
  id: string;
  name: string;
  frequency?: string;
}

interface LifeSphereCardProps {
  title: string;
  icon: React.ReactNode;
  habits: Habit[];
  className?: string;
}

export function LifeSphereCard({ title, icon, habits, className }: LifeSphereCardProps) {
  return (
    <Card className={cn("h-full transition-all hover:shadow-lg", className)}>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <div className="rounded-full bg-primary/10 p-2 text-primary">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {habits.map((habit) => (
            <li
              key={habit.id}
              className="flex items-center justify-between rounded-lg bg-muted/50 p-2 text-sm"
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
      </CardContent>
    </Card>
  );
}