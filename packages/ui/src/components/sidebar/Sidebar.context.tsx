'use client';

import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useUserPreference } from '../../hooks/use-user-preference';

/* * */

export type SidebarVisualMode = 'collapsed' | 'hovered' | 'pinned';

interface SidebarContextState {
	navigation: {
		open_group_ids: string[]
		toggleOpenGroup: (groupId: string) => void
	}
	presentation: {
		setVisualMode: (visualMode: SidebarVisualMode) => void
		toggleIsPinned: () => void
		visual_mode: SidebarVisualMode
	}
}

/* * */

const SidebarContext = createContext<SidebarContextState | undefined>(undefined);

export const useSidebarContext = () => {
	const context = useContext(SidebarContext);
	if (!context) throw new Error('useSidebarContext must be used within a SidebarContextProvider');
	return context;
};

/* * */

export function SidebarContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const [isPinned, setIsPinned] = useUserPreference<boolean>('ui', 'sidebar_is_pinned', false);
	const [currentVisualMode, setCurrentVisualMode] = useState<SidebarVisualMode>('collapsed');

	const [openGroupIds, setOpenGroupIds] = useUserPreference<string[]>('ui', 'sidebar_open_group_ids', []);

	//
	// B. Handle actions

	useEffect(() => {
		// Keep visual_mode in sync with the persisted pin preference.
		// Unpinning while the sidebar is open falls back to hovered (user is still interacting).
		setCurrentVisualMode((prev) => {
			if (isPinned) return 'pinned';
			if (prev === 'pinned') return 'hovered';
			return prev;
		});
	}, [isPinned]);

	const setVisualMode = useCallback((value: SidebarVisualMode) => {
		if (isPinned) setCurrentVisualMode('pinned');
		else if (value) setCurrentVisualMode(value);
		else setCurrentVisualMode('collapsed');
	}, [isPinned]);

	const toggleIsPinned = useCallback(() => {
		setIsPinned(prev => !prev);
	}, [setIsPinned]);

	const toggleOpenGroup = useCallback((groupId: string) => {
		setOpenGroupIds((prev) => {
			if (prev.includes(groupId)) return prev.filter(id => id !== groupId);
			return [...prev, groupId];
		});
	}, [setOpenGroupIds]);

	//
	// C. Define context value

	const contextValue: SidebarContextState = useMemo(() => ({
		navigation: {
			open_group_ids: openGroupIds,
			toggleOpenGroup,
		},
		presentation: {
			setVisualMode,
			toggleIsPinned,
			visual_mode: currentVisualMode,
		},
	}), [currentVisualMode, openGroupIds, setVisualMode, toggleIsPinned, toggleOpenGroup]);

	//
	// D. Render components

	return (
		<SidebarContext.Provider value={contextValue}>
			{children}
		</SidebarContext.Provider>
	);
};
