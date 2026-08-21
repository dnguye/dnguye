"use client";

import { createContext, useContext } from "react";

export interface CommandCenterValue {
  openPalette: () => void;
  openQuickRun: (skillId?: string | null) => void;
}

export const CommandCenterContext = createContext<CommandCenterValue>({
  openPalette: () => {},
  openQuickRun: () => {},
});

export function useCommandCenter(): CommandCenterValue {
  return useContext(CommandCenterContext);
}
