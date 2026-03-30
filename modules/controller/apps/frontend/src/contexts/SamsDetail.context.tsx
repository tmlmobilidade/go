'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { Sam } from '@tmlmobilidade/types';

/* * */

import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

export interface SamsDetailContextState {
	data: {
		sam: null | Sam
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

export const SamsDetailContext = createContext<SamsDetailContextState | undefined>(undefined);

export const useSamsDetailContext = () => {
	const context = useContext(SamsDetailContext);
	if (!context) {
		throw new Error('useSamsDetailContext must be used within a SamsDetailContextProvider');
	}
	return context;
};

export function SamsDetailContextProvider({ children, samId }: PropsWithChildren<{ samId: string }>) {
	//

	//
	// A. Setup variables

	const { data: samData, error: samError, isLoading: samLoading } = useSWR<Sam, Error>(samId && API_ROUTES.controller.SAMS_DETAIL(samId), { refreshInterval: 5000 });

	//
	// C. Handle actions

	//
	// D. Define context value

	const contextValue: SamsDetailContextState = useMemo(() => ({
		data: {
			sam: samData ?? null,
		},
		flags: {
			error: samError,
			loading: samLoading,
		},
	}), [samError, samLoading, samData]);
	// E. Render components

	return (
		<SamsDetailContext.Provider value={contextValue}>
			{children}
		</SamsDetailContext.Provider>
	);
}
