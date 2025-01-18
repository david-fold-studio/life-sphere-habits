import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SphereTitleSection } from "./SphereTitleSection";
import { GoalCard } from "./GoalCard";

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
        <div className="flex flex-col gap-6">
          <SphereTitleSection icon={icon} title={title} />
          
          {/* Goals Grid Container - 1 column on mobile, 2 on tablet, 2 on desktop (in remaining 2/3 space) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:w-2/3">
            {goals.slice(0, 2).map((goal) => (
              <GoalCard
                key={goal.id}
                name={goal.name}
                targetDate={goal.targetDate}
                habits={goal.habits}
                borderColorClass={borderColorClass}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}