import { Heart, Users, Clock, Leaf, HandHeart, Briefcase, DollarSign } from "lucide-react";
import { LifeSphereCard } from "./LifeSphereCard";

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

const spheresData = [
  {
    id: "faith",
    title: "Faith",
    icon: <Heart className="h-5 w-5" />,
    color: "border-rose-25 bg-rose-5",
    goals: [
      {
        id: "g1",
        name: "Spiritual Growth",
        targetDate: "2024-12-31",
        habits: [
          { id: "1", name: "Daily Prayer", frequency: "Daily" },
          { id: "2", name: "Meditation", frequency: "Daily" },
        ],
      },
      {
        id: "g2",
        name: "Community Service",
        targetDate: "2024-06-30",
        habits: [
          { id: "3", name: "Volunteer Work" },
        ],
      },
    ],
  },
  {
    id: "people",
    title: "People",
    icon: <Users className="h-5 w-5" />,
    color: "border-amber-25 bg-amber-5",
    goals: [
      {
        id: "g3",
        name: "Build Relationships",
        targetDate: "2024-12-31",
        habits: [
          { id: "4", name: "Family Time", frequency: "Weekly" },
          { id: "5", name: "Friend Meetups", frequency: "Monthly" },
        ],
      },
      {
        id: "g4",
        name: "Social Skills",
        targetDate: "2024-06-30",
        habits: [
          { id: "6", name: "Networking Events" },
        ],
      },
    ],
  },
  {
    id: "routine",
    title: "Routine",
    icon: <Clock className="h-5 w-5" />,
    color: "border-cyan-25 bg-cyan-5",
    goals: [
      {
        id: "g5",
        name: "Morning Routine",
        targetDate: "2024-12-31",
        habits: [
          { id: "7", name: "Early Rising", frequency: "Daily" },
          { id: "8", name: "Planning Day" },
        ],
      },
      {
        id: "g6",
        name: "Evening Routine",
        targetDate: "2024-06-30",
        habits: [
          { id: "9", name: "Reflection Time", frequency: "Daily" },
        ],
      },
    ],
  },
  {
    id: "health",
    title: "Health",
    icon: <Leaf className="h-5 w-5" />,
    color: "border-emerald-25 bg-emerald-5",
    goals: [
      {
        id: "g7",
        name: "Physical Fitness",
        targetDate: "2024-12-31",
        habits: [
          { id: "10", name: "Exercise", frequency: "Weekly" },
          { id: "11", name: "Healthy Eating", frequency: "Daily" },
        ],
      },
      {
        id: "g8",
        name: "Mental Wellness",
        targetDate: "2024-06-30",
        habits: [],
      },
    ],
  },
  {
    id: "service",
    title: "Service",
    icon: <HandHeart className="h-5 w-5" />,
    color: "border-blue-25 bg-blue-5",
    goals: [
      {
        id: "g9",
        name: "Community Impact",
        targetDate: "2024-12-31",
        habits: [
          { id: "13", name: "Volunteering", frequency: "Weekly" },
          { id: "14", name: "Mentoring", frequency: "Monthly" },
        ],
      },
      {
        id: "g10",
        name: "Giving Back",
        targetDate: "2024-06-30",
        habits: [
          { id: "15", name: "Charity Work" },
        ],
      },
    ],
  },
  {
    id: "work",
    title: "Work",
    icon: <Briefcase className="h-5 w-5" />,
    color: "border-purple-25 bg-purple-5",
    goals: [
      {
        id: "g11",
        name: "Career Growth",
        targetDate: "2024-12-31",
        habits: [
          { id: "16", name: "Skill Development", frequency: "Weekly" },
          { id: "17", name: "Networking", frequency: "Monthly" },
        ],
      },
      {
        id: "g12",
        name: "Professional Development",
        targetDate: "2024-06-30",
        habits: [],
      },
    ],
  },
  {
    id: "money",
    title: "Money",
    icon: <DollarSign className="h-5 w-5" />,
    color: "border-[#D946EF25] bg-[#D946EF10]",
    goals: [
      {
        id: "g13",
        name: "Financial Goals",
        targetDate: "2024-12-31",
        habits: [
          { id: "19", name: "Budgeting", frequency: "Weekly" },
          { id: "20", name: "Investment Review", frequency: "Monthly" },
        ],
      },
      {
        id: "g14",
        name: "Wealth Building",
        targetDate: "2024-06-30",
        habits: [
          { id: "21", name: "Financial Education" },
        ],
      },
    ],
  },
];

export function LifeSpheresGrid() {
  return (
    <div className="grid grid-cols-1 gap-4">
      {spheresData.map((sphere) => (
        <LifeSphereCard
          key={sphere.id}
          title={sphere.title}
          icon={sphere.icon}
          goals={sphere.goals}
          className={sphere.color}
        />
      ))}
    </div>
  );
}