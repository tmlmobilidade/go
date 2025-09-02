'use client';

/* * */

import { type DataTableHandle } from '@/components/datatable/DataTableContext';
import { useAgenciesContext } from '@/contexts/Agencies.context';
import { parseAsArrayOfStrings } from '@/lib/parse-string-array';
import { delayStatusValues, operationalStatusValues, type RideNormalized } from '@/types/normalized';
import { ParseRidesWorkerRequestMessage, ParseRidesWorkerResponseMessage } from '@/workers/parse-rides.worker';
import { useDebouncedState } from '@mantine/hooks';
import { type Ride, RIDE_ANALYSIS_GRADE_OPTIONS, type UnixTimestamp } from '@tmlmobilidade/types';
import { Dates, fetchData, type HttpResponse } from '@tmlmobilidade/utils';
import { parseAsInteger, useQueryState } from 'nuqs';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';

/* * */

interface RidesListContextState {
	actions: {
		setFilterAgency: (values: string[]) => void
		setFilterAnalysisEndedAtLastStop: (values: string[]) => void
		setFilterAnalysisExpectedApexValidationInterval: (values: string[]) => void
		setFilterAnalysisSimpleThreeVehicleEvents: (values: string[]) => void
		setFilterDateEnd: (value: number) => void
		setFilterDateStart: (value: number) => void
		setFilterDelayStatus: (values: string[]) => void
		setFilterOperationalStatus: (values: string[]) => void
		setFilterSearch: (values: string) => void
		setFilterSimpleThreeVehicleEvents: (values: string[]) => void
	}
	data: {
		filtered: RideNormalized[]
	}
	filters: {
		agency: string[]
		analysis_ended_at_last_stop: string[]
		analysis_expected_apex_validation_interval: string[]
		analysis_simple_three_vehicle_events_grade: string[]
		date_end: number
		date_start: number
		delay_status: string[]
		operational_status: string[]
		search: string
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
	const workerRef = useRef<null | Worker>(null);

	const dataRidesMap = useRef<Map<string, Ride> | null>(new Map());
	const [dataRidesNormalized, setDataRidesNormalized] = useState<RideNormalized[]>([]);

	const [filterSearch, setFilterSearch] = useQueryState('search', { defaultValue: '' });
	const [filterAgency, setFilterAgency] = useQueryState<string[]>('agency', parseAsArrayOfStrings.withDefault(agenciesContext.data.ids));
	const [filterDateEnd, setFilterDateEnd] = useQueryState<number>('date_end', parseAsInteger.withDefault(useMemo(() => Dates.now('Europe/Lisbon').plus({ minutes: 5 }).unix_timestamp, [])));
	const [filterDateStart, setFilterDateStart] = useQueryState<number>('date_start', parseAsInteger.withDefault(useMemo(() => Dates.now('Europe/Lisbon').minus({ minutes: 5 }).unix_timestamp, [])));
	const [filterDelayStatus, setFilterDelayStatus] = useQueryState<string[]>('delay_status', parseAsArrayOfStrings.withDefault(delayStatusValues));
	const [filterOperationalStatus, setFilterOperationalStatus] = useQueryState<string[]>('operational_status', parseAsArrayOfStrings.withDefault(operationalStatusValues));
	const [filterAnalysisSimpleThreeVehicleEvents, setFilterAnalysisSimpleThreeVehicleEvents] = useQueryState<string[]>('analysis_simple_three_vehicle_events', parseAsArrayOfStrings.withDefault([...RIDE_ANALYSIS_GRADE_OPTIONS, 'none']));
	const [filterAnalysisEndedAtLastStop, setFilterAnalysisEndedAtLastStop] = useQueryState<string[]>('analysis_ended_at_last_stop', parseAsArrayOfStrings.withDefault([...RIDE_ANALYSIS_GRADE_OPTIONS, 'none']));
	const [filterAnalysisExpectedApexValidationInterval, setFilterAnalysisExpectedApexValidationInterval] = useQueryState<string[]>('analysis_expected_apex_validation_interval', parseAsArrayOfStrings.withDefault([...RIDE_ANALYSIS_GRADE_OPTIONS, 'none']));

	const [flagsLastUpdateState, setFlagsLastUpdateState] = useDebouncedState<null | UnixTimestamp>(null, 100);
	const [flagsIsLoading, setFlagsIsLoading] = useState<boolean>(false);

	//
	// B. Fetch data

	useEffect(() => {
		(async () => {
			console.log('Fetching rides data...');
			setFlagsIsLoading(true);
			// Fetch Rides data from the API
			const response = await fetchData<Ride[]>('/api/rides', 'POST', {
				agency: filterAgency,
				date_end: filterDateEnd,
				date_start: filterDateStart,
				search: filterSearch,
			});
			// If there is an error or no data, return early
			if (!response.data) return;
			// Update the rides map with the fetched data
			const ridesMap = new Map<string, Ride>();
			response.data.forEach(item => ridesMap.set(item._id, item));
			dataRidesMap.current = ridesMap;
			setFlagsIsLoading(false);
		})();
	}, [
		filterAgency,
		filterSearch,
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
			// Setup a new worker instance to process the GTFS file.
			// If a worker already exists, terminate it to avoid duplicate processing.
			// if (!workerRef.current) workerRef.current.terminate();
			if (!workerRef.current) {
				workerRef.current = new Worker(new URL('@/workers/parse-rides.worker.ts', import.meta.url));
				workerRef.current.onmessage = (event: MessageEvent<ParseRidesWorkerResponseMessage>) => {
					setDataRidesNormalized(event.data.result ?? []);
				};
			}
			const requestMessage: ParseRidesWorkerRequestMessage = {
				filters: {
					analysis_ended_at_last_stop: filterAnalysisEndedAtLastStop,
					analysis_expected_apex_validation_interval: filterAnalysisExpectedApexValidationInterval,
					analysis_simple_three_vehicle_events: filterAnalysisSimpleThreeVehicleEvents,
					delay_status: filterDelayStatus,
					operational_status: filterOperationalStatus,
					simple_three_vehicle_events: filterSimpleThreeVehicleEvents,
				},
				rides: dataRidesMap.current,
			};
			workerRef.current.postMessage(requestMessage);
		};
		refreshCatalog();
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
			setFilterAnalysisEndedAtLastStop,
			setFilterAnalysisExpectedApexValidationInterval,
			setFilterAnalysisSimpleThreeVehicleEvents,
			setFilterDateEnd,
			setFilterDateStart,
			setFilterDelayStatus,
			setFilterOperationalStatus,
			setFilterSearch,
			setFilterSimpleThreeVehicleEvents,
		},
		data: {
			filtered: dataRidesNormalized,
		},
		filters: {
			agency: filterAgency,
			analysis_ended_at_last_stop: filterAnalysisEndedAtLastStop,
			analysis_expected_apex_validation_interval: filterAnalysisExpectedApexValidationInterval,
			analysis_simple_three_vehicle_events_grade: filterAnalysisSimpleThreeVehicleEvents,
			date_end: filterDateEnd,
			date_start: filterDateStart,
			delay_status: filterDelayStatus,
			operational_status: filterOperationalStatus,
			search: filterSearch,
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
		filterDateEnd,
		filterDateStart,
		filterDelayStatus,
		filterOperationalStatus,
		filterSearch,
		filterAnalysisSimpleThreeVehicleEvents,
		filterAnalysisExpectedApexValidationInterval,
		filterAnalysisEndedAtLastStop,
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
