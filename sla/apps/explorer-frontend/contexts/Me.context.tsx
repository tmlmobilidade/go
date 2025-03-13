'use client';

import { swrFetcher } from '@/lib/http';
import { Routes } from '@/lib/routes';
import { User } from '@tmlmobilidade/core-types';
import { AppWrapper, CMIcon, SidebarItemProps } from '@tmlmobilidade/ui';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

interface MeContextState {
	data: {
		sidebar: SidebarItemProps[]
		user: User
	}
	flags: {
		error: null | string
		loading: boolean
	}
}

const MeContext = createContext<MeContextState | undefined>(undefined);

export function useMeContext() {
	const context = useContext(MeContext);
	if (!context) {
		throw new Error('useMeContext must be used within a MeContextProvider');
	}
	return context;
}

export const MeContextProvider = ({
	children,
	initialSidebar,
	initialUser,
}: {
	children: React.ReactNode
	initialSidebar?: MeContextState['data']['sidebar']
	initialUser?: MeContextState['data']['user']
}) => {
	//
	// A. Setup variables
	const [userState, setUserState] = useState<MeContextState['data']['user']>(
		initialUser ?? ({} as User),
	);
	const [sidebarState, setSidebarState] = useState<
		MeContextState['data']['sidebar']
	>(initialSidebar ?? []);

	const { data, error, isLoading } = useSWR<{ sidebar: SidebarItemProps[], user: User }>(
		Routes.AUTH_API + Routes.ME,
		swrFetcher,
	);

	console.log('Routes.AUTH_API + Routes.ME', Routes.AUTH_API + Routes.ME);

	// Update user
	useEffect(() => {
		if (data?.user) setUserState(data.user);
		if (data?.sidebar) setSidebarState(data.sidebar);
	}, [data]);

	//
	// E. Define context value
	const contextValue: MeContextState = useMemo(
		() => ({
			data: {
				sidebar: sidebarState,
				user: userState,
			},
			flags: {
				error: error,
				loading: isLoading,
			},
		}),
		[userState, isLoading, error, sidebarState],
	);

	if (contextValue.flags.loading) {
		return <div>loading...</div>;
	}

	//
	// F. Render components
	return (
		<MeContext.Provider value={contextValue}>

			<AppWrapper
				icon={<CMIcon />}
				sidebarItems={sidebarState}
				headerProps={{
					user_name: userState?.first_name,
				}}
			>
				{children}
			</AppWrapper>
		</MeContext.Provider>
	);
};
