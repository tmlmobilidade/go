'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { YearPeriod } from '@tmlmobilidade/types';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface PeriodsContextState {
	data: {
		raw: YearPeriod[]
	}
}

/* * */

const PeriodsContext = createContext<PeriodsContextState | undefined>(undefined);

export function usePeriodsContext() {
	const context = useContext(PeriodsContext);
	if (!context) {
		throw new Error('usePeriodsContext must be used within a PeriodsContextProvider');
	}
	return context;
}

/* * */

export const PeriodsContextProvider = ({ agencyId, children }: PropsWithChildren<{ agencyId?: string }>) => {
	//

	//
	// A. Fetch data

	const { data: periodsData } = useSWR<YearPeriod[]>(API_ROUTES.dates.YEAR_PERIODS_LIST);

	//
	// B. Define context value

	const contextValue: PeriodsContextState = useMemo(() => ({

		data: {
			raw: periodsData?.filter(period => !agencyId || period.agency_ids.includes(agencyId)) || [],
		},
	}), [periodsData, agencyId]);

	//
	// H. Render components

	return (
		<PeriodsContext.Provider value={contextValue}>
			{children}
		</PeriodsContext.Provider>
	);

	//
};
