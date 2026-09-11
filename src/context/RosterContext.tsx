import { createContext, useContext, useState, type ReactNode } from "react";
import type { RosterMember } from "../lib/faceRecognition";

interface RosterContextValue {
  roster: RosterMember[];
  addMember: (member: RosterMember) => void;
  removeMember: (id: string) => void;
}

const RosterContext = createContext<RosterContextValue | null>(null);

export function RosterProvider({ children }: { children: ReactNode }) {
  const [roster, setRoster] = useState<RosterMember[]>([]);

  const addMember = (member: RosterMember) => {
    setRoster((prev) => [...prev, member]);
  };

  const removeMember = (id: string) => {
    setRoster((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <RosterContext.Provider value={{ roster, addMember, removeMember }}>
      {children}
    </RosterContext.Provider>
  );
}

export function useRoster() {
  const ctx = useContext(RosterContext);
  if (!ctx) throw new Error("useRoster must be used within a RosterProvider");
  return ctx;
}
