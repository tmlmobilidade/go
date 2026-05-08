'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { Typology } from '@tmlmobilidade/types';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface TypologiesContextState {
	data: {
		raw: Typology[]
	}
}

/* * */

const TypologiesContext = createContext<TypologiesContextState | undefined>(undefined);

export function useTypologiesContext() {
	const context = useContext(TypologiesContext);
	if (!context) {
		throw new Error('useTypologiesContext must be used within a TypologiesContextProvider');
	}
	return context;
}

/* * */

export const TypologiesContextProvider = ({ agencyId, children }: PropsWithChildren<{ agencyId?: string }>) => {
	//

	//
	// A. Fetch data

	const { data: typologiesData } = useSWR<Typology[]>(API_ROUTES.offer.TYPOLOGIES_LIST);

	//
	// B. Define context value

	const contextValue: TypologiesContextState = useMemo(() => ({

		data: {
			raw: typologiesData?.filter(typology => !agencyId || typology.agency_ids.includes(agencyId)) || [],
		},
	}), [typologiesData, agencyId]);

	//
	// H. Render components

	return (
		<TypologiesContext.Provider value={contextValue}>
			{children}
		</TypologiesContext.Provider>
	);

	//
};
