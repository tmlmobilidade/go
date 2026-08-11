'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Annotation } from '@tmlmobilidade/types';
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

	const { data } = useSWR<Annotation[]>(API_ROUTES.dates.ANNOTATIONS_LIST);

	//
	// B. Transform data

	const annotations = useMemo(() => data?.filter(annotation => !agencyId || annotation.agency_ids.includes(agencyId)) ?? [], [agencyId, data]);

	//
	// C. Render components

	return (
		<AnnotationsContext.Provider value={{ data: { raw: annotations } }}>
			{children}
		</AnnotationsContext.Provider>
	);

	//
}
