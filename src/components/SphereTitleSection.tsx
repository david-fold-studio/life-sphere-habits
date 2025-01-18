import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SphereTitleSectionProps {
  icon: React.ReactNode;
  title: string;
}

export function SphereTitleSection({ icon, title }: SphereTitleSectionProps) {
  return (
    <div className="flex flex-col lg:flex-col lg:items-start lg:w-1/3">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-white p-2">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {/* Mobile: Icon button */}
      <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden self-end">
        <Plus className="h-4 w-4" />
      </Button>
      {/* Desktop: Text button */}
      <Button variant="ghost" size="sm" className="hidden lg:inline-flex w-full mt-4">
        <Plus className="h-4 w-4 mr-2" />
        Add Goal
      </Button>
    </div>
  );
}