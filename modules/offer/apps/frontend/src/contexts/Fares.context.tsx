'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Fare } from '@tmlmobilidade/go-types-offer';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface FaresContextState {
	data: {
		raw: Fare[]
	}
}

/* * */

const FaresContext = createContext<FaresContextState | undefined>(undefined);

export function useFaresContext() {
	const context = useContext(FaresContext);
	if (!context) {
		throw new Error('useFaresContext must be used within a FaresContextProvider');
	}
	return context;
}

/* * */

export const FaresContextProvider = ({ agencyId, children }: PropsWithChildren<{ agencyId?: string }>) => {
	//

	//
	// A. Fetch data

	const { data: faresData } = useSWR<ApiResponse<Fare[]>>(API_ROUTES.offer.FARES_LIST, {
		fetcher: async url => await fetchApiData<Fare[]>({ url }),
	});

	//
	// B. Define context value

	const contextValue: FaresContextState = useMemo(() => ({

		data: {
			raw: faresData?.data?.filter(fare => !agencyId || fare.agency_ids.includes(agencyId)) || [],
		},
	}), [faresData, agencyId]);

	//
	// H. Render components

	return (
		<FaresContext.Provider value={contextValue}>
			{children}
		</FaresContext.Provider>
	);

	//
};
