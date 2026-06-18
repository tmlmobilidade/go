'use client';

import { createContext, useContext } from 'react';

/* * */

export type SidebarVisualMode = 'collapsed' | 'hovered' | 'pinned';

export interface SidebarVisualModeContextValue {
	expanded: boolean
	iconOnly: boolean
	visualMode: SidebarVisualMode
}

const defaultValue: SidebarVisualModeContextValue = {
	expanded: true,
	iconOnly: false,
	visualMode: 'pinned',
};

export const SidebarVisualModeContext = createContext<SidebarVisualModeContextValue>(defaultValue);

/* * */

export function useSidebarVisualMode() {
	return useContext(SidebarVisualModeContext);
}
