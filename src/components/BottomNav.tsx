import { Calendar, CircleDot, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const items = [
  {
    title: "Today",
    url: "/",
    icon: CircleDot,
  },
  {
    title: "Spheres",
    url: "/spheres",
    icon: CircleDot,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t md:block lg:hidden">
      <div className="flex justify-around items-center h-16">
        {items.map((item) => (
          <Link
            key={item.title}
            to={item.url}
            className={cn(
              "flex flex-col items-center justify-center gap-1 p-2 text-sm text-muted-foreground hover:text-foreground transition-colors",
              location.pathname === item.url && "text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.title}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}