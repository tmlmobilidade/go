'use client';

/* * */

import type { Line } from '@carrismetropolitana/api-types/network';

import { Routes } from '@/routes';
import { standardSwrFetcher } from '@go/utils';
import { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface LinesContextState {
	data: {
		lines: Line[]
	}
	flags: {
		is_loading: boolean
	}
}

/* * */

const LinesContext = createContext<LinesContextState | undefined>(undefined);

export function useLinesContext() {
	const context = useContext(LinesContext);
	if (!context) {
		throw new Error('useLinesContext must be used within a LinesContextProvider');
	}
	return context;
}

/* * */

export const LinesContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Fetch data

	const { data: allLinesData, isLoading: allLinesLoading } = useSWR<Line[]>(`${Routes.CMET_API}/lines`, standardSwrFetcher);

	//
	// B. Handle actions

	//
	// C. Define context value

	const contextValue: LinesContextState = useMemo(() => ({
		data: {
			lines: allLinesData || [],
		},
		flags: {
			is_loading: allLinesLoading,
		},
	}), [
		allLinesData,
		allLinesLoading,
	]);

	//
	// D. Render components

	return (
		<LinesContext.Provider value={contextValue}>
			{children}
		</LinesContext.Provider>
	);

	//
};
