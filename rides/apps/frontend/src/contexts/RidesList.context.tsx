'use client';

/* * */

import { type DataTableHandle } from '@/components/datatable/DataTableContext';
import { useAgenciesContext } from '@/contexts/Agencies.context';
import { parseAsArrayOfStrings } from '@/lib/parse-string-array';
import { type RideNormalized } from '@/types/normalized';
import { getRideNormalized } from '@/utils/get-ride-normalized';
import { useDebouncedState } from '@mantine/hooks';
import { type Ride, type UnixTimestamp } from '@tmlmobilidade/types';
import { Dates, fetchData, type HttpResponse } from '@tmlmobilidade/utils';
import { useQueryState } from 'nuqs';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';

/* * */

interface RidesListContextState {
	actions: {
		centerListOnNow: () => void
		setFilterAgency: (values: string[]) => void
	}
	data: {
		filtered: RideNormalized[]
	}
	filters: {
		agency: string[]
	}
	flags: {
		error: Error | null
		last_update: null | UnixTimestamp
		loading: boolean
		on_now: boolean
	}
	refs: {
		datatable: React.RefObject<DataTableHandle | null>
	}
}

/* * */

const RidesListContext = createContext<RidesListContextState | undefined>(undefined);

export function useRidesListContext() {
	const context = useContext(RidesListContext);
	if (!context) {
		throw new Error('useRidesListContext must be used within a RidesListContextProvider');
	}
	return context;
}

/* * */

export const RidesListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const agenciesContext = useAgenciesContext();

	const webSocketRef = useRef<null | WebSocket>(null);
	const dataTableRef = useRef<DataTableHandle | null>(null);

	const listIsOnNowRef = useRef<boolean>(false);

	const dataRidesMap = useRef<Map<string, Ride> | null>(new Map());

	const [dataRidesNormalized, setDataRidesNormalized] = useState<RideNormalized[]>([]);
	const [flagsLastUpdateState, setFlagsLastUpdateState] = useDebouncedState<null | UnixTimestamp>(null, 100);

	const [filterAgency, setFilterAgency] = useQueryState<string[]>('agency', parseAsArrayOfStrings.withDefault(agenciesContext.data.ids));

	//
	// B. Fetch data

	useEffect(() => {
		console.log('Fetching rides data...');
		(async () => {
			// Fetch Rides data from the API
			const response = await fetch('/api/rides', {
				body: JSON.stringify({ agency: filterAgency }),
				method: 'POST',
			});
			const responseData: HttpResponse<Ride[]> = await response.json();
			console.log('Fetched rides data:', responseData);
			// If there is an error or no data, return early
			if (!response.ok || !responseData.data) return;
			// Update the rides map with the fetched data
			const ridesMap = new Map<string, Ride>();
			responseData.data.forEach(item => ridesMap.set(item._id, item));
			dataRidesMap.current = ridesMap;
		})();
	}, [filterAgency]);

	useEffect(() => {
		// This effect runs everytime there is a change in the websocket reference,
		// as the goal is to always maintain an open connection. If the connection is
		// already open, there is no need to open a new one, so return early.
		// If the connection is not open, then try to open a new one.
		if (webSocketRef.current) return;
		// Open a new WebSocket connection
		console.log('Opening WebSocket connection...');
		webSocketRef.current = new WebSocket('ws://localhost:52002/rides/ws');
		webSocketRef.current.addEventListener('open', handleWebsocketInit);
		webSocketRef.current.addEventListener('message', handleIncomingMessage);
		// Cleanup on unmount
		return () => {
			webSocketRef.current.removeEventListener('open', handleWebsocketInit);
			webSocketRef.current.removeEventListener('message', handleIncomingMessage);
			// webSocketRef.current.close();
			webSocketRef.current = null;
		};
	}, []);

	const handleWebsocketInit = () => {
		if (!webSocketRef.current) return;
		if (webSocketRef.current.readyState !== webSocketRef.current.OPEN) return;
		webSocketRef.current.send('init');
	};

	const handleIncomingMessage = (event: MessageEvent<string>) => {
		// Try to decode the message and extract the Ride data
		const eventData: HttpResponse<Ride> = JSON.parse(event.data);
		// If the ride is not in the normalized data, return early
		if (!dataRidesMap.current.has(eventData.data._id)) return;
		// Normalize the ride data and update the state
		dataRidesMap.current.set(eventData.data._id, eventData.data);
		setFlagsLastUpdateState(Dates.now('Europe/Lisbon').unix_timestamp);
	};

	//
	// C. Transform data

	useEffect(() => {
		const refreshCatalog = () => {
			const result: RideNormalized[] = Array
				.from(dataRidesMap.current.values())
				.map(item => getRideNormalized(item))
				.sort((a, b) => a.agency_id.localeCompare(b.agency_id))
				.sort((a, b) => a.start_time_scheduled - b.start_time_scheduled);
			setDataRidesNormalized(result);
		};
		const interval = setInterval(refreshCatalog, 1000);
		return () => clearInterval(interval);
	}, []);

	//
	// B. Handle actions

	useEffect(() => {
		// Skip if no data is available
		if (!listIsOnNowRef.current) return;
		// Find out the index of the closest ride to the current time
		const nowUnixTimestamp = Dates.now('Europe/Lisbon').unix_timestamp;
		const closestRideIndex = dataRidesNormalized.findIndex(ride => ride.start_time_scheduled >= nowUnixTimestamp);
		// If no ride is found, do nothing
		if (closestRideIndex === -1) return;
		// Scroll to the closest ride
		if (dataTableRef.current) {
			console.log('Scrolling to closest ride:', closestRideIndex, dataRidesNormalized[closestRideIndex].line_id, dataRidesNormalized[closestRideIndex].headsign);
			dataTableRef.current.scrollToIndex(closestRideIndex, -2);
			listIsOnNowRef.current = true;
		}
	}, [dataRidesNormalized, listIsOnNowRef.current]);

	const centerListOnNow = () => {
		listIsOnNowRef.current = false;
	};

	//
	// C. Define context value

	const contextValue: RidesListContextState = useMemo(() => ({
		actions: {
			centerListOnNow,
			setFilterAgency,
		},
		data: {
			filtered: dataRidesNormalized,
		},
		filters: {
			agency: filterAgency,
		},
		flags: {
			error: null,
			last_update: flagsLastUpdateState,
			loading: false,
			on_now: listIsOnNowRef.current,
		},
		refs: {
			datatable: dataTableRef,
		},
	}), [
		dataRidesNormalized,
		filterAgency,
		flagsLastUpdateState,
	]);

	//
	// D. Render components

	return (
		<RidesListContext.Provider value={contextValue}>
			{children}
		</RidesListContext.Provider>
	);

	//
};
