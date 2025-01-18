import { Card } from "@/components/ui/card";
import { format, addHours, startOfDay, startOfWeek, addDays } from "date-fns";

const CalendarView = () => {
  // Sample scheduled habits with fixed times and their associated spheres
  const scheduledHabits = [
    { 
      id: "1", 
      name: "Morning Meditation", 
      startTime: "07:00", 
      endTime: "07:30", 
      day: 1,
      sphere: "mental" 
    },
    { 
      id: "2", 
      name: "Evening Run", 
      startTime: "18:00", 
      endTime: "19:00", 
      day: 2,
      sphere: "health"
    },
    { 
      id: "3", 
      name: "Read a Book", 
      startTime: "20:00", 
      endTime: "21:00", 
      day: 3,
      sphere: "education"
    },
    { 
      id: "4", 
      name: "Yoga Session", 
      startTime: "08:00", 
      endTime: "09:00", 
      day: 4,
      sphere: "health"
    },
    { 
      id: "5", 
      name: "Journal Writing", 
      startTime: "21:00", 
      endTime: "21:30", 
      day: 5,
      sphere: "personal"
    },
  ];

  const today = new Date();
  const weekStart = startOfWeek(today);
  
  // Generate time slots for 24 hours
  const timeSlots = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: format(addHours(startOfDay(today), i), "h:mm a"),
  }));

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return {
      date,
      dayName: format(date, "EEE"),
      fullDate: format(date, "MMM d"),
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

  return (
    <div className="container mx-auto p-4 py-8">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Weekly Schedule</h1>
        <p className="text-muted-foreground">
          Week of {format(weekStart, "MMMM d, yyyy")}
        </p>
      </header>

      <div className="flex">
        {/* Time column */}
        <div className="w-20 flex-shrink-0">
          <div className="h-16" /> {/* Empty space for day headers */}
          {timeSlots.map(({ hour, label }) => (
            <div key={hour} className="h-20 border-t text-sm text-muted-foreground pr-2 text-right">
              {label}
            </div>
          ))}
        </div>

        {/* Days columns */}
        <div className="flex-grow flex">
          {weekDays.map(({ date, dayName, fullDate }, dayIndex) => (
            <div key={dayIndex} className="flex-1 relative border-l first:border-l-0">
              {/* Day header */}
              <div className="h-16 border-b p-2 text-center sticky top-0 bg-background">
                <div className="font-semibold">{dayName}</div>
                <div className="text-sm text-muted-foreground">{fullDate}</div>
              </div>

              {/* Time grid */}
              <div className="relative">
                {timeSlots.map(({ hour }) => (
                  <div
                    key={hour}
                    className="h-20 border-t border-gray-200"
                  />
                ))}

                {/* Events */}
                {scheduledHabits
                  .filter((habit) => habit.day === dayIndex)
                  .map((habit) => (
                    <Card
                      key={habit.id}
                      className={`absolute left-0 right-0 mx-1 p-2`}
                      style={{
                        ...getEventStyle(habit.startTime),
                        backgroundColor: `var(--sphere-${habit.sphere})`,
                      }}
                    >
                      <div className="font-medium text-sm">{habit.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {habit.startTime} - {habit.endTime}
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;