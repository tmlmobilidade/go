'use client';

import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

/* * */

const FEEDBACK_OPERATOR_FILTER_STORAGE_KEY = 'performance.feedback.operator_filter.agency_ids';

interface FeedbackOperatorFilterContextState {
	selectedAgencyIds: string[]
	setSelectedAgencyIds: (agencyIds: string[]) => void
}

/* * */

const FeedbackOperatorFilterContext = createContext<FeedbackOperatorFilterContextState | undefined>(undefined);

export function useFeedbackOperatorFilterContext() {
	const context = useContext(FeedbackOperatorFilterContext);
	if (!context) {
		throw new Error('useFeedbackOperatorFilterContext must be used within a FeedbackOperatorFilterContextProvider');
	}

	return context;
}

/* * */

function getStoredSelectedAgencyIds() {
	if (typeof window === 'undefined') return [];

	try {
		const storedValue = window.localStorage.getItem(FEEDBACK_OPERATOR_FILTER_STORAGE_KEY);
		const parsedValue = storedValue ? JSON.parse(storedValue) : [];

		if (!Array.isArray(parsedValue)) return [];
		return parsedValue.filter(value => typeof value === 'string');
	} catch {
		return [];
	}
}

/* * */

export function FeedbackOperatorFilterContextProvider({ children }: PropsWithChildren) {
	//
	// A. Setup state

	const [hasLoadedStoredValue, setHasLoadedStoredValue] = useState(false);
	const [selectedAgencyIds, setSelectedAgencyIds] = useState<string[]>([]);

	//
	// B. Transform data

	const contextValue = useMemo((): FeedbackOperatorFilterContextState => ({
		selectedAgencyIds,
		setSelectedAgencyIds,
	}), [selectedAgencyIds]);

	//
	// C. Handle effects

	useEffect(() => {
		setSelectedAgencyIds(getStoredSelectedAgencyIds());
		setHasLoadedStoredValue(true);
	}, []);

	useEffect(() => {
		if (!hasLoadedStoredValue) return;

		window.localStorage.setItem(FEEDBACK_OPERATOR_FILTER_STORAGE_KEY, JSON.stringify(selectedAgencyIds));
	}, [hasLoadedStoredValue, selectedAgencyIds]);

	//
	// D. Render provider

	return (
		<FeedbackOperatorFilterContext.Provider value={contextValue}>
			{children}
		</FeedbackOperatorFilterContext.Provider>
	);
}
