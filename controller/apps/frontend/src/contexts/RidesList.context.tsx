'use client';

/* * */

import { type DataTableHandle } from '@/components/datatable/DataTableContext';
import { useAgenciesContext } from '@/contexts/Agencies.context';
import { parseAsArrayOfStrings } from '@/lib/parse-string-array';
import { delayStatusValues, gradeValues, operationalStatusValues, type RideNormalized } from '@/types/normalized';
import { getRideNormalized } from '@/utils/get-ride-normalized';
import { useDebouncedState } from '@mantine/hooks';
import { type Ride, type UnixTimestamp } from '@tmlmobilidade/types';
import { Dates, type HttpResponse } from '@tmlmobilidade/utils';
import { parseAsInteger, useQueryState } from 'nuqs';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';

/* * */

interface RidesListContextState {
	actions: {
		setFilterAgency: (values: string[]) => void
		setFilterDateEnd: (value: number) => void
		setFilterDateStart: (value: number) => void
		setFilterDelayStatus: (values: string[]) => void
		setFilterOperationalStatus: (values: string[]) => void
		setFilterSimpleThreeVehicleEvents: (values: string[]) => void
	}
	data: {
		filtered: RideNormalized[]
	}
	filters: {
		agency: string[]
		date_end: number
		date_start: number
		delay_status: string[]
		operational_status: string[]
		simple_three_vehicle_events: string[]
	}
	flags: {
		error: Error | null
		last_update: null | UnixTimestamp
		loading: boolean
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

	const dataRidesMap = useRef<Map<string, Ride> | null>(new Map());
	const [dataRidesNormalized, setDataRidesNormalized] = useState<RideNormalized[]>([]);

	const [filterAgency, setFilterAgency] = useQueryState<string[]>('agency', parseAsArrayOfStrings.withDefault(agenciesContext.data.ids));
	const [filterDateEnd, setFilterDateEnd] = useQueryState<number>('date_end', parseAsInteger.withDefault(useMemo(() => Dates.now('Europe/Lisbon').plus({ minutes: 5 }).unix_timestamp, [])));
	const [filterDateStart, setFilterDateStart] = useQueryState<number>('date_start', parseAsInteger.withDefault(useMemo(() => Dates.now('Europe/Lisbon').minus({ minutes: 5 }).unix_timestamp, [])));
	const [filterDelayStatus, setFilterDelayStatus] = useQueryState<string[]>('delay_status', parseAsArrayOfStrings.withDefault(delayStatusValues));
	const [filterOperationalStatus, setFilterOperationalStatus] = useQueryState<string[]>('operational_status', parseAsArrayOfStrings.withDefault(operationalStatusValues));
	const [filterSimpleThreeVehicleEvents, setFilterSimpleThreeVehicleEvents] = useQueryState<string[]>('s3ve', parseAsArrayOfStrings.withDefault(gradeValues));

	const [flagsLastUpdateState, setFlagsLastUpdateState] = useDebouncedState<null | UnixTimestamp>(null, 100);
	const [flagsIsLoading, setFlagsIsLoading] = useState<boolean>(false);

	//
	// B. Fetch data

	useEffect(() => {
		console.log('Fetching rides data...');
		(async () => {
			setFlagsIsLoading(true);
			// Fetch Rides data from the API
			const response = await fetch('/api/rides', {
				body: JSON.stringify({
					agency: filterAgency,
					date_end: filterDateEnd,
					date_start: filterDateStart,
					simple_three_vehicle_events: filterSimpleThreeVehicleEvents,
				}),
				method: 'POST',
			});
			const responseData: HttpResponse<Ride[]> = await response.json();
			// If there is an error or no data, return early
			if (!response.ok || !responseData.data) return;
			// Update the rides map with the fetched data
			const ridesMap = new Map<string, Ride>();
			responseData.data.forEach(item => ridesMap.set(item._id, item));
			dataRidesMap.current = ridesMap;
			setFlagsIsLoading(false);
		})();
	}, [
		filterAgency,
		filterSimpleThreeVehicleEvents,
		filterDateStart,
		filterDateEnd,
	]);

	useEffect(() => {
		// This effect runs everytime there is a change in the websocket reference,
		// as the goal is to always maintain an open connection. If the connection is
		// already open, there is no need to open a new one, so return early.
		// If the connection is not open, then try to open a new one.
		if (webSocketRef.current) return;
		// Open a new WebSocket connection
		console.log('Opening WebSocket connection...');
		const wsProtocol = (window.location.hostname === 'localhost') ? 'ws' : 'wss';
		webSocketRef.current = new WebSocket(`${wsProtocol}://${window.location.host}/api/rides/ws`);
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
				.filter(item => filterOperationalStatus.includes(item.operational_status))
				.filter(item => filterDelayStatus.includes(item.delay_status))
				.sort((a, b) => a.agency_id.localeCompare(b.agency_id))
				.sort((a, b) => a.start_time_scheduled - b.start_time_scheduled);
			setDataRidesNormalized(result);
		};
		const interval = setInterval(refreshCatalog, 1000);
		return () => clearInterval(interval);
	}, [
		filterOperationalStatus,
		filterDelayStatus,
		filterSimpleThreeVehicleEvents,
		filterAgency,
		filterDateStart,
		filterDateEnd,
	]);

	//
	// B. Handle actions

	//
	// C. Define context value

	const contextValue: RidesListContextState = useMemo(() => ({
		actions: {
			setFilterAgency,
			setFilterDateEnd,
			setFilterDateStart,
			setFilterDelayStatus,
			setFilterOperationalStatus,
			setFilterSimpleThreeVehicleEvents,
		},
		data: {
			filtered: dataRidesNormalized,
		},
		filters: {
			agency: filterAgency,
			date_end: filterDateEnd,
			date_start: filterDateStart,
			delay_status: filterDelayStatus,
			operational_status: filterOperationalStatus,
			simple_three_vehicle_events: filterSimpleThreeVehicleEvents,
		},
		flags: {
			error: null,
			last_update: flagsLastUpdateState,
			loading: flagsIsLoading,
		},
		refs: {
			datatable: dataTableRef,
		},
	}), [
		dataRidesNormalized,
		filterAgency,
		filterDelayStatus,
		filterOperationalStatus,
		filterSimpleThreeVehicleEvents,
		filterDateStart,
		filterDateEnd,
		flagsLastUpdateState,
		flagsIsLoading,
		dataTableRef,
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
