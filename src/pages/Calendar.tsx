import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { addDays, format, startOfWeek } from "date-fns";

const CalendarView = () => {
  // Sample scheduled habits with fixed times
  const scheduledHabits = [
    { id: "1", name: "Morning Meditation", time: "07:00", day: 1 }, // Monday
    { id: "2", name: "Evening Run", time: "18:00", day: 2 }, // Tuesday
    { id: "3", name: "Read a Book", time: "20:00", day: 3 }, // Wednesday
    { id: "4", name: "Yoga Session", time: "08:00", day: 4 }, // Thursday
    { id: "5", name: "Journal Writing", time: "21:00", day: 5 }, // Friday
  ];

  const today = new Date();
  const weekStart = startOfWeek(today);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dayHabits = scheduledHabits.filter((habit) => habit.day === i);
    return { date, habits: dayHabits };
  });

  return (
    <div className="container mx-auto p-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">Weekly Schedule</h1>
        <p className="text-muted-foreground">Your habits for the week</p>
      </header>

      <div className="grid grid-cols-7 gap-4">
        {weekDays.map(({ date, habits }) => (
          <Card key={date.toString()} className="p-4">
            <div className="text-center mb-2">
              <div className="font-semibold">{format(date, "EEE")}</div>
              <div className="text-sm text-muted-foreground">
                {format(date, "MMM d")}
              </div>
            </div>
            <div className="space-y-2">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="text-sm p-2 bg-secondary rounded-md"
                >
                  <div className="font-medium">{habit.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {habit.time}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;