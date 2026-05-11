'use client';

import { getModuleConfig } from '@tmlmobilidade/consts';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import { Loader } from '../components/loaders/Loader';
import { SidebarItemProps } from '../components/sidebar/SidebarItem';

/* * */

interface SidebarContextState {
	data: {
		sidebar: SidebarItemProps[]
	}
	flags: {
		error: null | string
		loading: boolean
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

	const [sidebarState, setSidebarState] = useState<SidebarContextState['data']['sidebar']>([]);

	//
	// B. Fetch data

	const { data, error, isLoading } = useSWR<{ sidebar: SidebarItemProps[] }>(`${getModuleConfig('auth', 'api_url')}/users/me`);

	//
	// C. Handle actions

	useEffect(() => {
		if (data?.sidebar) {
			setSidebarState(data.sidebar);
		}
	}, [data]);

	//
	// D. Define context value

	const contextValue: SidebarContextState = useMemo(() => ({
		data: {
			sidebar: sidebarState,
		},
		flags: {
			error: error,
			loading: isLoading,
		},
	}), [isLoading, error, sidebarState]);

	//
	// E. Render components

	if (contextValue.flags.loading) {
		return <Loader />;
	}

	return (
		<SidebarContext.Provider value={contextValue}>
			{children}
		</SidebarContext.Provider>
	);

	//
};
