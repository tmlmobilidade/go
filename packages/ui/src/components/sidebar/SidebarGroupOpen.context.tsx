'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/* * */

export interface SidebarGroupOpenContextValue {
	isGroupOpen: (groupId: string) => boolean
	setGroupOpen: (groupId: string, open: boolean) => void
	toggleGroup: (groupId: string) => void
}

const SidebarGroupOpenContext = createContext<SidebarGroupOpenContextValue | null>(null);

/* * */

export interface SidebarGroupOpenProviderProps {
	children: React.ReactNode
	defaultOpenGroupIds?: readonly string[]
}

export function SidebarGroupOpenProvider({ children, defaultOpenGroupIds = [] }: SidebarGroupOpenProviderProps) {
	const [openByGroupId, setOpenByGroupId] = useState<Record<string, boolean>>(() => {
		const initial: Record<string, boolean> = {};
		for (const id of defaultOpenGroupIds) initial[id] = true;
		return initial;
	});

	useEffect(() => {
		if (!defaultOpenGroupIds.length) return;

		setOpenByGroupId((prev) => {
			const next = { ...prev };
			for (const id of defaultOpenGroupIds) {
				if (next[id] === undefined) next[id] = true;
			}
			return next;
		});
	}, [defaultOpenGroupIds]);

	const isGroupOpen = useCallback((groupId: string) => {
		return openByGroupId[groupId] ?? false;
	}, [openByGroupId]);

	const setGroupOpen = useCallback((groupId: string, open: boolean) => {
		setOpenByGroupId(prev => ({ ...prev, [groupId]: open }));
	}, []);

	const toggleGroup = useCallback((groupId: string) => {
		setOpenByGroupId(prev => ({ ...prev, [groupId]: !(prev[groupId] ?? false) }));
	}, []);

	const value = useMemo(() => ({
		isGroupOpen,
		setGroupOpen,
		toggleGroup,
	}), [isGroupOpen, setGroupOpen, toggleGroup]);

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
