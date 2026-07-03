'use client';

/* * */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';

import { useMeContext } from '../../contexts';
import { useUserPreference } from '../../hooks';

/* * */

const SIDEBAR_PREFERENCE_SCOPE = 'ui';
const SIDEBAR_OPEN_GROUP_IDS_KEY = 'sidebar_open_group_ids';

/* * */

export interface SidebarOpenGroupsContextValue {
	isGroupOpen: (groupId: string) => boolean
	setGroupOpen: (groupId: string, open: boolean) => void
	toggleGroup: (groupId: string) => void
}

const SidebarOpenGroupsContext = createContext<null | SidebarOpenGroupsContextValue>(null);

/* * */

export interface SidebarOpenGroupsProviderProps {
	children: React.ReactNode
	defaultOpenGroupIds?: readonly string[]
}

export function SidebarOpenGroupsProvider({ children, defaultOpenGroupIds = [] }: SidebarOpenGroupsProviderProps) {
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

	useEffect(() => {
		if (!defaultOpenGroupIds.length) return;

		const missing = defaultOpenGroupIds.filter(id => !openGroupIds.includes(id));
		if (!missing.length) return;

		setOpenGroupIds([...openGroupIds, ...missing]);
	}, [defaultOpenGroupIds, openGroupIds, setOpenGroupIds]);

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
		<SidebarOpenGroupsContext.Provider value={value}>
			{children}
		</SidebarOpenGroupsContext.Provider>
	);
}

/* * */

export function useSidebarOpenGroups() {
	const context = useContext(SidebarOpenGroupsContext);
	if (!context) {
		throw new Error('useSidebarOpenGroups must be used within SidebarOpenGroupsProvider');
	}

	return context;
}
