'use client';

/* * */

import { type QuickLink } from '@tmlmobilidade/types';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface QuickLinksContextState {
	data: {
		raw: QuickLink[]
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const QuickLinksContext = createContext<QuickLinksContextState | undefined>(undefined);

export const useQuickLinksContext = () => {
	const context = useContext(QuickLinksContext);
	if (!context) {
		throw new Error('useQuickLinksContext must be used within a QuickLinksContextProvider');
	}
	return context;
};

/* * */

export const QuickLinksContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Fetch data

	const { data: allQuickLinksData, error: allQuickLinksError, isLoading: allQuickLinksLoading } = useSWR<QuickLink[], Error>('/api/quick-links');

	//
	// B. Define context value

	const contextValue: QuickLinksContextState = useMemo(() => ({
		data: {
			raw: allQuickLinksData ?? [],
		},
		flags: {
			error: allQuickLinksError,
			loading: allQuickLinksLoading,
		},
	}), [
		allQuickLinksData,
		allQuickLinksError,
		allQuickLinksLoading,
	]);

	//
	// C. Render components

	return (
		<QuickLinksContext.Provider value={contextValue}>
			{children}
		</QuickLinksContext.Provider>
	);

	//
};
