'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Annotation } from '@tmlmobilidade/go-types-dates';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface AnnotationsContextState {
	data: {
		raw: Annotation[]
	}
}

/* * */

const AnnotationsContext = createContext<AnnotationsContextState | undefined>(undefined);

export function useAnnotationsContext() {
	const context = useContext(AnnotationsContext);
	if (!context) {
		throw new Error('useAnnotationsContext must be used within an AnnotationsContextProvider');
	}
	return context;
}

/* * */

export function AnnotationsContextProvider({ agencyId, children }: PropsWithChildren<{ agencyId?: string }>) {
	//

	//
	// A. Fetch data

	const { data } = useSWR<ApiResponse<Annotation[]>>(API_ROUTES.dates.ANNOTATIONS_LIST, { fetcher: async url => await fetchApiData<Annotation[]>({ url }) });

	//
	// B. Transform data

	const annotations = useMemo(() => data?.data?.filter(annotation => !agencyId || annotation.agency_ids.includes(agencyId)) ?? [], [agencyId, data]);

	//
	// C. Render components

	return (
		<AnnotationsContext.Provider value={{ data: { raw: annotations } }}>
			{children}
		</AnnotationsContext.Provider>
	);

	//
}
