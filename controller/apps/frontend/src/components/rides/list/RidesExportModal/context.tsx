'use client';

/* * */

import { type UnixTimestamp } from '@tmlmobilidade/types';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

/* * */

interface RidesExportModalContextState {
	actions: {
		onEndDateChange: (date: UnixTimestamp) => void
		onStartDateChange: (date: UnixTimestamp) => void
	}
	data: {
		endDate: undefined | UnixTimestamp
		startDate: undefined | UnixTimestamp
	}
	flags: {
		canSave: boolean
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const RidesExportModalContext = createContext<RidesExportModalContextState | undefined>(undefined);

export function useRidesExportModalContext() {
	const context = useContext(RidesExportModalContext);
	if (!context) {
		throw new Error('useRidesExportModalContext must be used within a RidesExportModalContextProvider');
	}
	return context;
}

/* * */

export const RidesExportModalContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables
	const [endDate, setEndDate] = useState<undefined | UnixTimestamp>(undefined);
	const [startDate, setStartDate] = useState<undefined | UnixTimestamp>(undefined);

	//
	// B. Transform data

	//
	// C. Handle actions

	//
	// D. Define context value

	const contextValue: RidesExportModalContextState = useMemo(() => {
		return {
			actions: {
				onEndDateChange: setEndDate,
				onStartDateChange: setStartDate,
			},
			data: {
				endDate,
				startDate,
			},
			flags: {
				canSave: !!endDate && !!startDate,
				error: undefined,
				loading: false,
			},
		};
	}, [endDate, startDate]);

	//
	// E. Render components

	return (
		<RidesExportModalContext.Provider value={contextValue}>
			{children}
		</RidesExportModalContext.Provider>
	);

	//
};
