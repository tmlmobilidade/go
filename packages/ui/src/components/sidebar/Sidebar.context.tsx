'use client';

import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import { useCurrentUrl } from '../../hooks/use-current-url';
import { useUserPreference } from '../../hooks/use-user-preference';
import { getDefaultOpenGroupIds } from './utils';

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

	const currentUrl = useCurrentUrl();

	const [isPinned, setIsPinned] = useUserPreference<boolean>('ui', 'sidebar_is_pinned', false);
	const [currentVisualMode, setCurrentVisualMode] = useState<SidebarVisualMode>('collapsed');

	console.log('isPinned', isPinned);

	const [openGroupIds, setOpenGroupIds] = useUserPreference<string[]>('ui', 'sidebar_open_group_ids', getDefaultOpenGroupIds(currentUrl?.pathname));

	//
	// C. Handle actions

	const setVisualMode = useCallback((value: SidebarVisualMode) => {
		if (isPinned) setCurrentVisualMode('pinned');
		else if (value) setCurrentVisualMode(value);
		else setCurrentVisualMode('collapsed');
	}, [isPinned]);

	const toggleIsPinned = useCallback(() => {
		setIsPinned(!isPinned);
	}, [isPinned, setIsPinned]);

	const toggleOpenGroup = useCallback((groupId: string) => {
		setOpenGroupIds((prev) => {
			if (prev.includes(groupId)) return prev.filter(id => id !== groupId);
			return [...prev, groupId];
		});
	}, []);

	//
	// D. Define context value

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
	// E. Render components

	return (
		<SidebarContext.Provider value={contextValue}>
			{children}
		</SidebarContext.Provider>
	);
};
