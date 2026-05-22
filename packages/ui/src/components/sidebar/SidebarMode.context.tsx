'use client';

import { createContext, useContext } from 'react';

/* * */

export type SidebarVisualMode = 'collapsed' | 'hovered' | 'pinned';

export interface SidebarModeContextValue {
	expanded: boolean
	iconOnly: boolean
	visualMode: SidebarVisualMode
}

const defaultValue: SidebarModeContextValue = {
	expanded: true,
	iconOnly: false,
	visualMode: 'pinned',
};

export const SidebarModeContext = createContext<SidebarModeContextValue>(defaultValue);

/* * */

export function useSidebarMode() {
	return useContext(SidebarModeContext);
}
