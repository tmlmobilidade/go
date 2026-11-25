'use client';

import { createContext, type PropsWithChildren, useContext } from 'react';

import { useValidationsDetailResults, type UseValidationsDetailResultsReturnType } from './use-validations-detail-results';

/* * */

const ValidationsDetailResultsContext = createContext<undefined | UseValidationsDetailResultsReturnType>(undefined);

/* * */

export function useValidationsDetailResultsContext(): UseValidationsDetailResultsReturnType {
	const context = useContext(ValidationsDetailResultsContext);
	if (!context) throw new Error('useValidationsDetailResultsContext must be used within a ValidationsDetailResultsContextProvider');
	return context;
}

/* * */

export function ValidationsDetailResultsContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const value = useValidationsDetailResults();

	//
	// B. Render components

	return <ValidationsDetailResultsContext.Provider value={value}>{children}</ValidationsDetailResultsContext.Provider>;

	//
}
