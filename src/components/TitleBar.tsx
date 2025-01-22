import React from "react";

interface TitleBarProps {
  title: string;
  description?: string;
}

export function TitleBar({ title, description }: TitleBarProps) {
  return (
    <div className="border-b">
      <div className="container flex h-16 items-center px-4">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}