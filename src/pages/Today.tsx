import { TitleBar } from "@/components/TitleBar";

const Today = () => {
  return (
    <div className="flex h-screen flex-col">
      <TitleBar 
        title="Today" 
        description="Your daily overview and tasks"
      />
      <div className="flex-1 p-4">
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Daily Overview</h2>
            <p className="text-muted-foreground">Daily overview coming soon...</p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Today's Tasks</h2>
            <p className="text-muted-foreground">Tasks coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Today;