"use client";
import { createContext, useContext, useRef } from "react";

const StitchContext = createContext<{
  gridRef: React.RefObject<HTMLDivElement | null>;
} | null>(null);

export function StitchProvider({ children }: { children: React.ReactNode }) {
  const gridRef = useRef<HTMLDivElement>(null);

  return (
    <StitchContext.Provider value={{ gridRef }}>
      {children}
    </StitchContext.Provider>
  );
}

export const useStitch = () => useContext(StitchContext)!;
