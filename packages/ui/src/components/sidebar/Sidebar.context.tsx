'use client';

import { getModuleConfig } from '@tmlmobilidade/consts';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import { useCurrentUrl } from '../../hooks/use-current-url';
import { useUserPreference } from '../../hooks/use-user-preference';
import { SidebarItemProps } from './SidebarNavigationGroupItem';
import { getDefaultOpenGroupIds } from './utils';

/* * */

export type SidebarVisualMode = 'collapsed' | 'hovered' | 'pinned';

interface SidebarContextState {
	data: {
		available_items: SidebarItemProps[]
		default_open_group_ids: string[]
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

	const [availableItems, setAvailableItems] = useState<SidebarItemProps[]>([]);

	const [isPinned, setIsPinned] = useUserPreference<boolean>('ui', 'sidebar_is_pinned', false);

	const [currentVisualMode, setCurrentVisualMode] = useState<SidebarVisualMode>('collapsed');

	//
	// B. Fetch data

	const { data: userData } = useSWR<{ sidebar: SidebarItemProps[] }>(`${getModuleConfig('auth', 'api_url')}/users/me`);

	//
	// C. Handle actions

	const defaultOpenGroupIds = getDefaultOpenGroupIds(currentUrl?.pathname);

	//
	// C. Handle actions

	useEffect(() => {
		if (!userData?.sidebar) return;
		setAvailableItems(userData.sidebar);
	}, [userData.sidebar]);

	const setVisualMode = useCallback((value: SidebarVisualMode) => {
		if (isPinned) setCurrentVisualMode('pinned');
		else if (value) setCurrentVisualMode(value);
		else setCurrentVisualMode('collapsed');
	}, [isPinned]);

	const toggleIsPinned = useCallback(() => {
		setIsPinned(!isPinned);
	}, [isPinned, setIsPinned]);

	//
	// D. Define context value

	const contextValue: SidebarContextState = useMemo(() => ({
		data: {
			available_items: availableItems,
			default_open_group_ids: defaultOpenGroupIds,
		},
		presentation: {
			setVisualMode,
			toggleIsPinned,
			visual_mode: currentVisualMode,
		},
	}), [availableItems, currentVisualMode, defaultOpenGroupIds, setVisualMode, toggleIsPinned]);

	//
	// E. Render components

	return (
		<SidebarContext.Provider value={contextValue}>
			{children}
		</SidebarContext.Provider>
	);
};
