import { LifeSpheresGrid } from "@/components/LifeSpheresGrid";

const Index = () => {
  return (
    <div className="container mx-auto p-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">Life Spheres & Habits</h1>
        <p className="text-muted-foreground">Track and manage habits across different areas of your life</p>
      </header>
      <LifeSpheresGrid />
    </div>
  );
};

export default Index;