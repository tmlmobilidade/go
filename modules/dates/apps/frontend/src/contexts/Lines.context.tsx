'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Line } from '@tmlmobilidade/types';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface LinesContextState {
	data: {
		raw: Line[]
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const LinesContext = createContext<LinesContextState | undefined>(undefined);

export const useLinesContext = () => {
	const context = useContext(LinesContext);
	if (!context) {
		throw new Error('useLinesContext must be used within an LinesContextProvider');
	}
	return context;
};

/* * */

export const LinesContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Fetch data

	const { data: allLinesData, error: allLinesError, isLoading: allLinesLoading } = useSWR<Line[], Error>(API_ROUTES.offer.LINES_LIST);

	//
	// B. Define context value

	const contextValue: LinesContextState = useMemo(() => ({
		data: {
			raw: allLinesData?.sort((a, b) => a.code.localeCompare(b.code)) ?? [],
		},
		flags: {
			error: allLinesError,
			loading: allLinesLoading,
		},
	}), [
		allLinesData,
		allLinesError,
		allLinesLoading,
	]);

	//
	// C. Render components

	return (
		<LinesContext.Provider value={contextValue}>
			{children}
		</LinesContext.Provider>
	);

	//
};
