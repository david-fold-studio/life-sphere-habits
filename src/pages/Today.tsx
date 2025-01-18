const Today = () => {
  return (
    <div className="container mx-auto p-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Today</h1>
        <p className="text-muted-foreground">Your daily overview and tasks</p>
      </header>

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
  );
};

export default Today;