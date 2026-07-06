'use client';

import type { FeedbackEntitySummary } from '@/utils/metrics/feedback-metrics';

import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

/* * */

interface FeedbackEntityDetailModalContextState {
	actions: {
		close: () => void
		open: (item: FeedbackEntitySummary) => void
	}
	data: {
		item?: FeedbackEntitySummary
	}
}

/* * */

const FeedbackEntityDetailModalContext = createContext<FeedbackEntityDetailModalContextState | undefined>(undefined);

export function useFeedbackEntityDetailModalContext() {
	const context = useContext(FeedbackEntityDetailModalContext);
	if (!context) {
		throw new Error('useFeedbackEntityDetailModalContext must be used within a FeedbackEntityDetailModalContextProvider');
	}

	return context;
}

/* * */

export function FeedbackEntityDetailModalContextProvider({ children }: PropsWithChildren) {
	//
	// A. Setup state

	const [item, setItem] = useState<FeedbackEntitySummary>();

	//
	// B. Define actions

	const open = useCallback((nextItem: FeedbackEntitySummary) => {
		setItem(nextItem);
	}, []);

	const close = useCallback(() => {
		setItem(undefined);
	}, []);

	//
	// C. Define context value

	const contextValue: FeedbackEntityDetailModalContextState = useMemo(() => ({
		actions: {
			close,
			open,
		},
		data: {
			item,
		},
	}), [close, item, open]);

	//
	// D. Render provider

	return (
		<FeedbackEntityDetailModalContext.Provider value={contextValue}>
			{children}
		</FeedbackEntityDetailModalContext.Provider>
	);
}
