'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { Event } from '@tmlmobilidade/types';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface EventsContextState {
	data: {
		raw: Event[]
	}
}

/* * */

const EventsContext = createContext<EventsContextState | undefined>(undefined);

export function useEventsContext() {
	const context = useContext(EventsContext);
	if (!context) {
		throw new Error('useEventsContext must be used within a EventsContextProvider');
	}
	return context;
}

/* * */

export const EventsContextProvider = ({ agencyId, children }: PropsWithChildren<{ agencyId?: string }>) => {
	//

	//
	// A. Fetch data

	const { data: eventsData } = useSWR<Event[]>(API_ROUTES.dates.EVENTS_LIST);

	//
	// B. Define context value

	const contextValue: EventsContextState = useMemo(() => ({

		data: {
			raw: eventsData?.filter(event => !agencyId || event.agency_ids.includes(agencyId)) || [],
		},
	}), [eventsData, agencyId]);

	//
	// H. Render components

	return (
		<EventsContext.Provider value={contextValue}>
			{children}
		</EventsContext.Provider>
	);

	//
};
