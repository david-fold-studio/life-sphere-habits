import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SphereTitleSection } from "./SphereTitleSection";
import { GoalCard } from "./GoalCard";
import { AddGoalForm } from "./AddGoalForm";
import { v4 as uuidv4 } from "uuid";

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

export function LifeSphereCard({ title, icon, goals: initialGoals, className }: LifeSphereCardProps) {
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const borderColorClass = className?.split(' ').find(cls => cls.startsWith('border-')) || '';

  const handleSaveGoal = (goalTitle: string, targetDate: Date) => {
    const newGoal: Goal = {
      id: uuidv4(),
      name: goalTitle,
      targetDate: targetDate.toISOString(),
      habits: [],
    };
    
    setGoals([...goals, newGoal]);
    setIsAddingGoal(false);
  };

  return (
    <Card className={cn("transition-all hover:shadow-lg border-2", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <SphereTitleSection 
            icon={icon} 
            title={title} 
            onAddGoal={() => setIsAddingGoal(true)} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isAddingGoal && (
              <AddGoalForm
                onSave={handleSaveGoal}
                onCancel={() => setIsAddingGoal(false)}
              />
            )}
            {goals.map((goal) => (
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