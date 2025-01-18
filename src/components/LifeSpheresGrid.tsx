import { Heart, Brain, Users, Briefcase, Gem, Book, Leaf } from "lucide-react";
import { LifeSphereCard } from "./LifeSphereCard";

const spheresData = [
  {
    id: "health",
    title: "Health & Fitness",
    icon: <Heart className="h-5 w-5" />,
    color: "border-rose-25 bg-rose-5",
    habits: [
      { id: "1", name: "Morning Exercise", frequency: "Every weekday" },
      { id: "2", name: "Meditation", frequency: "Daily" },
      { id: "3", name: "Meal Planning" },
    ],
  },
  {
    id: "mental",
    title: "Mental Wellbeing",
    icon: <Brain className="h-5 w-5" />,
    color: "border-purple-25 bg-purple-5",
    habits: [
      { id: "4", name: "Journaling", frequency: "Daily" },
      { id: "5", name: "Therapy Session", frequency: "Bi-weekly" },
      { id: "6", name: "Digital Detox" },
    ],
  },
  {
    id: "relationships",
    title: "Relationships",
    icon: <Users className="h-5 w-5" />,
    color: "border-blue-25 bg-blue-5",
    habits: [
      { id: "7", name: "Family Dinner", frequency: "Weekly" },
      { id: "8", name: "Date Night", frequency: "Bi-weekly" },
      { id: "9", name: "Call Parents" },
    ],
  },
  {
    id: "career",
    title: "Career & Work",
    icon: <Briefcase className="h-5 w-5" />,
    color: "border-amber-25 bg-amber-5",
    habits: [
      { id: "10", name: "Skill Development", frequency: "Weekly" },
      { id: "11", name: "Networking", frequency: "Monthly" },
      { id: "12", name: "Goal Review" },
    ],
  },
  {
    id: "personal",
    title: "Personal Growth",
    icon: <Gem className="h-5 w-5" />,
    color: "border-emerald-25 bg-emerald-5",
    habits: [
      { id: "13", name: "Reading", frequency: "Daily" },
      { id: "14", name: "Learning Language", frequency: "Weekly" },
      { id: "15", name: "Self-reflection" },
    ],
  },
  {
    id: "education",
    title: "Education",
    icon: <Book className="h-5 w-5" />,
    color: "border-cyan-25 bg-cyan-5",
    habits: [
      { id: "16", name: "Online Course", frequency: "Weekly" },
      { id: "17", name: "Study Session", frequency: "Every weekday" },
      { id: "18", name: "Research" },
    ],
  },
  {
    id: "environment",
    title: "Environment",
    icon: <Leaf className="h-5 w-5" />,
    color: "border-teal-25 bg-teal-5",
    habits: [
      { id: "19", name: "Recycling", frequency: "Daily" },
      { id: "20", name: "Garden Care", frequency: "Weekly" },
      { id: "21", name: "Eco-audit" },
    ],
  },
];

export function LifeSpheresGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {spheresData.map((sphere) => (
        <LifeSphereCard
          key={sphere.id}
          title={sphere.title}
          icon={sphere.icon}
          habits={sphere.habits}
          className={sphere.color}
        />
      ))}
    </div>
  );
}