const Settings = () => {
  return (
    <div className="container mx-auto p-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </header>

      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          <p className="text-muted-foreground">Account settings coming soon...</p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          <p className="text-muted-foreground">Preferences settings coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;