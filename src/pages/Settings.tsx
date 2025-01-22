import { TitleBar } from "@/components/TitleBar";

const Settings = () => {
  return (
    <div className="flex h-screen flex-col">
      <TitleBar 
        title="Settings" 
        description="Manage your account and preferences"
      />
      <div className="flex-1 p-4">
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
    </div>
  );
};

export default Settings;