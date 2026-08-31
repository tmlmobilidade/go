'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Holiday } from '@tmlmobilidade/go-types-offer';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
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

	const { data: holidaysData } = useSWR<ApiResponse<Holiday[]>>(API_ROUTES.dates.HOLIDAYS_LIST, {
		fetcher: async url => await fetchApiData<Holiday[]>({ url }),
	});

	//
	// B. Define context value

	const contextValue: HolidaysContextState = useMemo(() => ({
		data: {
			raw: holidaysData?.data?.filter(period => !agencyId || period.agency_ids.includes(agencyId)) || [],
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
