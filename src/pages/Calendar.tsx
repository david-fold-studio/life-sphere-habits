import { Card } from "@/components/ui/card";
import { format, addHours, startOfDay, setHours, setMinutes } from "date-fns";

const CalendarView = () => {
  // Sample scheduled habits with fixed times
  const scheduledHabits = [
    { id: "1", name: "Morning Meditation", startTime: "07:00", endTime: "07:30", day: 1 },
    { id: "2", name: "Evening Run", startTime: "18:00", endTime: "19:00", day: 2 },
    { id: "3", name: "Read a Book", startTime: "20:00", endTime: "21:00", day: 3 },
    { id: "4", name: "Yoga Session", startTime: "08:00", endTime: "09:00", day: 4 },
    { id: "5", name: "Journal Writing", startTime: "21:00", endTime: "21:30", day: 5 },
  ];

  const today = new Date();
  const dayStart = startOfDay(today);

  // Generate time slots for 24 hours
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const time = addHours(dayStart, i);
    return {
      hour: i,
      label: format(time, "h:mm a"),
    };
  });

  // Helper function to calculate event position and height
  const getEventStyle = (startTime: string) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const top = (hours * 60 + minutes) * (100 / 1440); // Convert to percentage of day
    return {
      top: `${top}%`,
    };
  };

  const todayHabits = scheduledHabits.filter((habit) => 
    habit.day === today.getDay()
  );

  return (
    <div className="container mx-auto p-4 py-8">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Daily Schedule</h1>
        <p className="text-muted-foreground">{format(today, "EEEE, MMMM d, yyyy")}</p>
      </header>

      <div className="flex">
        {/* Time column */}
        <div className="w-20 flex-shrink-0">
          {timeSlots.map(({ hour, label }) => (
            <div key={hour} className="h-20 border-t text-sm text-muted-foreground pr-2 text-right">
              {label}
            </div>
          ))}
        </div>

        {/* Events column */}
        <div className="flex-grow relative border rounded-lg">
          {/* Time grid */}
          {timeSlots.map(({ hour }) => (
            <div
              key={hour}
              className="h-20 border-t border-gray-200"
            />
          ))}

          {/* Events */}
          {todayHabits.map((habit) => (
            <Card
              key={habit.id}
              className="absolute left-0 right-0 mx-2 p-2 bg-blue-50 border-blue-200"
              style={getEventStyle(habit.startTime)}
            >
              <div className="font-medium text-sm">{habit.name}</div>
              <div className="text-xs text-muted-foreground">
                {habit.startTime} - {habit.endTime}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;