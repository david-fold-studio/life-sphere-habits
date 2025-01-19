import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SphereTitleSectionProps {
  icon: React.ReactNode;
  title: string;
  onAddGoal: () => void;
}

export function SphereTitleSection({ icon, title, onAddGoal }: SphereTitleSectionProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between lg:flex-row lg:items-center lg:w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white p-2">{icon}</div>
          <h3 className="font-semibold">{title}</h3>
        </div>
        {/* Mobile: Icon button */}
        <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={onAddGoal}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {/* Tablet and Desktop: Text button */}
      <Button variant="ghost" size="sm" className="hidden md:inline-flex" onClick={onAddGoal}>
        <Plus className="h-4 w-4 mr-2" />
        Add Goal
      </Button>
    </div>
  );
}