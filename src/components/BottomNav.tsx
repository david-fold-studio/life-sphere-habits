import { Calendar, CircleDot, LogOut, Settings } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    } else {
      navigate("/auth");
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      });
    }
  };

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
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 p-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </nav>
  );
}