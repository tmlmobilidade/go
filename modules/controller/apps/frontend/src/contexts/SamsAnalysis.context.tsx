'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { Sam, SamAnalysis } from '@tmlmobilidade/types';

/* * */

import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

export interface SamsAnalysisContextState {
	data: {
		analysis: SamAnalysis[]
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

export const SamsAnalysisContext = createContext<SamsAnalysisContextState | undefined>(undefined);

export const useSamsAnalysisContext = () => {
	const context = useContext(SamsAnalysisContext);
	if (!context) {
		throw new Error('useSamsAnalysisContext must be used within a SamsAnalysisContextProvider');
	}
	return context;
};

export function SamsAnalysisContextProvider({ children, samId }: PropsWithChildren<{ samId: Sam['_id'] }>) {
	//

	//
	// A. Setup variables

	const { data: samAnalysisData, error: samAnalysisError, isLoading: samAnalysisLoading } = useSWR<SamAnalysis[], Error>(API_ROUTES.controller.SAMS_DETAIL_ANALYSIS(samId.toString()), { refreshInterval: 5000 });

	//
	// C. Handle actions

	//
	// D. Define context value

	const contextValue: SamsAnalysisContextState = useMemo(() => ({
		data: {
			analysis: samAnalysisData ?? [],
		},
		flags: {
			error: samAnalysisError,
			loading: samAnalysisLoading,
		},
	}), [samAnalysisError, samAnalysisLoading, samAnalysisData]);
	// E. Render components

	return (
		<SamsAnalysisContext.Provider value={contextValue}>
			{children}
		</SamsAnalysisContext.Provider>
	);
}
