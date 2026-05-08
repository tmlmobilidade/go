'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { Holiday } from '@tmlmobilidade/types';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface HolidaysContextState {
	data: {
		raw: Holiday[]
	}
}

/* * */

const HolidaysContext = createContext<HolidaysContextState | undefined>(undefined);

export function useHolidaysContext() {
	const context = useContext(HolidaysContext);
	if (!context) {
		throw new Error('useHolidaysContext must be used within a HolidaysContextProvider');
	}
	return context;
}

/* * */

export const HolidaysContextProvider = ({ agencyId, children }: PropsWithChildren<{ agencyId?: string }>) => {
	//

	//
	// A. Fetch data

	const { data: holidaysData } = useSWR<Holiday[]>(API_ROUTES.dates.HOLIDAYS_LIST);

	//
	// B. Define context value

	const contextValue: HolidaysContextState = useMemo(() => ({

		data: {
			raw: holidaysData?.filter(period => !agencyId || period.agency_ids.includes(agencyId)) || [],
		},
	}), [holidaysData, agencyId]);

	//
	// H. Render components

	return (
		<HolidaysContext.Provider value={contextValue}>
			{children}
		</HolidaysContext.Provider>
	);

	//
};
