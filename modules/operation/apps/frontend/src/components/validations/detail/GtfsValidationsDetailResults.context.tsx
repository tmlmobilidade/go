'use client';

import { createContext, type PropsWithChildren, useContext } from 'react';

import { useValidationsDetailResults, type UseValidationsDetailResultsReturnType } from './use-validations-detail-results';

/* * */

const GtfsValidationsDetailResultsContext = createContext<undefined | UseValidationsDetailResultsReturnType>(undefined);

/* * */

export function useGtfsValidationsDetailResultsContext(): UseValidationsDetailResultsReturnType {
	const context = useContext(GtfsValidationsDetailResultsContext);
	if (!context) throw new Error('useGtfsValidationsDetailResultsContext must be used within a GtfsValidationsDetailResultsContextProvider');
	return context;
}

/* * */

export function GtfsValidationsDetailResultsContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const value = useValidationsDetailResults();

	//
	// B. Render components

	return (
		<GtfsValidationsDetailResultsContext.Provider value={value}>
			{children}
		</GtfsValidationsDetailResultsContext.Provider>
	);
}
