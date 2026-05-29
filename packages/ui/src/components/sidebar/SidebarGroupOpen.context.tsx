'use client';

/* * */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';

import { useMeContext } from '../../contexts';
import { useUserPreference } from '../../hooks';

/* * */

const SIDEBAR_PREFERENCE_SCOPE = 'ui';
const SIDEBAR_OPEN_GROUP_IDS_KEY = 'sidebar_open_group_ids';

/* * */

export interface SidebarGroupOpenContextValue {
	isGroupOpen: (groupId: string) => boolean
	setGroupOpen: (groupId: string, open: boolean) => void
	toggleGroup: (groupId: string) => void
}

const SidebarGroupOpenContext = createContext<null | SidebarGroupOpenContextValue>(null);

/* * */

export interface SidebarGroupOpenProviderProps {
	children: React.ReactNode
	defaultOpenGroupIds?: readonly string[]
}

export function SidebarGroupOpenProvider({ children, defaultOpenGroupIds = [] }: SidebarGroupOpenProviderProps) {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const [openGroupIds, setOpenGroupIds] = useUserPreference<string[]>(
		SIDEBAR_PREFERENCE_SCOPE,
		SIDEBAR_OPEN_GROUP_IDS_KEY,
		[],
	);

	const hasSeededInitialOpenGroupsRef = useRef(false);

	//
	// B. Handle actions

	useEffect(() => {
		const saved = meContext.actions.getPreference<string[]>(SIDEBAR_PREFERENCE_SCOPE, SIDEBAR_OPEN_GROUP_IDS_KEY);
		if (saved !== undefined) return;
		if (hasSeededInitialOpenGroupsRef.current) return;
		if (!defaultOpenGroupIds.length) return;

		hasSeededInitialOpenGroupsRef.current = true;
		setOpenGroupIds([...defaultOpenGroupIds], { save: false });
	}, [defaultOpenGroupIds, meContext.actions, meContext.data.user, setOpenGroupIds]);

	//
	// C. Handle callbacks

	const isGroupOpen = useCallback((groupId: string) => {
		return openGroupIds.includes(groupId);
	}, [openGroupIds]);

	const setGroupOpen = useCallback((groupId: string, open: boolean) => {
		if (open) {
			if (openGroupIds.includes(groupId)) return;
			setOpenGroupIds([...openGroupIds, groupId]);
			return;
		}

		if (!openGroupIds.includes(groupId)) return;
		setOpenGroupIds(openGroupIds.filter(id => id !== groupId));
	}, [openGroupIds, setOpenGroupIds]);

	const toggleGroup = useCallback((groupId: string) => {
		setGroupOpen(groupId, !openGroupIds.includes(groupId));
	}, [openGroupIds, setGroupOpen]);

	//
	// D. Return

	const value = useMemo(() => ({
		isGroupOpen,
		setGroupOpen,
		toggleGroup,
	}), [isGroupOpen, setGroupOpen, toggleGroup]);

	//
	// E. Render components

	return (
		<SidebarGroupOpenContext.Provider value={value}>
			{children}
		</SidebarGroupOpenContext.Provider>
	);
}

/* * */

export function useSidebarGroupOpen() {
	const context = useContext(SidebarGroupOpenContext);
	if (!context) {
		throw new Error('useSidebarGroupOpen must be used within SidebarGroupOpenProvider');
	}

	return context;
}
