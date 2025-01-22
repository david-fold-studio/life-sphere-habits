import { LifeSpheresGrid } from "@/components/LifeSpheresGrid";
import { TitleBar } from "@/components/TitleBar";

const Index = () => {
  return (
    <div className="flex h-screen flex-col">
      <TitleBar 
        title="Life Spheres" 
        description="Track and manage habits across different areas of your life"
      />
      <div className="flex-1 p-4">
        <LifeSpheresGrid />
      </div>
    </div>
  );
};

export default Index;