'use client';

/* * */

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { parseAsArrayOfStrings } from '@/lib/parse-string-array';
import { useDebouncedState, useDebouncedValue } from '@mantine/hooks';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type RideNormalized } from '@tmlmobilidade/types';
import { DelayStatusSchema, OperationalStatusSchema } from '@tmlmobilidade/types';
import { RIDE_ANALYSIS_GRADE_OPTIONS, RideAcceptanceStatusSchema, type UnixTimestamp } from '@tmlmobilidade/types';
import { type HttpResponse } from '@tmlmobilidade/utils';
import { usePathname } from 'next/navigation';
import { parseAsInteger, useQueryState } from 'nuqs';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useRef } from 'react';
import useSWR from 'swr';

/* * */

export interface RidesListContextState {
	actions: {
		setFilterAcceptanceStatus: (values: string[]) => void
		setFilterAgency: (values: string[]) => void
		setFilterAnalysisEndedAtLastStop: (values: string[]) => void
		setFilterAnalysisExpectedApexValidationInterval: (values: string[]) => void
		setFilterAnalysisSimpleThreeVehicleEvents: (values: string[]) => void
		setFilterAnalysisTransactionSequentiality: (values: string[]) => void
		setFilterDateEnd: (value: number) => void
		setFilterDateStart: (value: number) => void
		setFilterDelayStatus: (values: string[]) => void
		setFilterOperationalStatus: (values: string[]) => void
		setFilterSearch: (values: string) => void
	}
	data: {
		filtered: RideNormalized[]
		selectedRideId: string | undefined
	}
	filters: {
		acceptance_status: string[]
		agency: string[]
		analysis_ended_at_last_stop: string[]
		analysis_expected_apex_validation_interval: string[]
		analysis_simple_three_vehicle_events_grade: string[]
		analysis_transaction_sequentiality: string[]
		date_end: number
		date_start: number
		delay_status: string[]
		operational_status: string[]
		search: string
	}
	flags: {
		error: Error | null
		last_update: null | UnixTimestamp
		loading: boolean
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

	const pathname = usePathname();

	const agenciesContext = useAgenciesContext();

	const webSocketRef = useRef<null | WebSocket>(null);

	const [filterSearch, setFilterSearch] = useQueryState('search', { defaultValue: '' });
	const [debouncedFilterSearch] = useDebouncedValue(filterSearch.trim(), 500);

	const [filterAgency, setFilterAgency] = useQueryState<string[]>('agency', parseAsArrayOfStrings.withDefault(agenciesContext.data.ids));
	const [filterDateEnd, setFilterDateEnd] = useQueryState<number>('date_end', parseAsInteger.withDefault(useMemo(() => Dates.now('Europe/Lisbon').plus({ minutes: 5 }).unix_timestamp, [])));
	const [filterDateStart, setFilterDateStart] = useQueryState<number>('date_start', parseAsInteger.withDefault(useMemo(() => Dates.now('Europe/Lisbon').minus({ minutes: 5 }).unix_timestamp, [])));
	const [filterDelayStatus, setFilterDelayStatus] = useQueryState<string[]>('delay_status', parseAsArrayOfStrings.withDefault(DelayStatusSchema.options));
	const [filterOperationalStatus, setFilterOperationalStatus] = useQueryState<string[]>('operational_status', parseAsArrayOfStrings.withDefault(OperationalStatusSchema.options));
	const [filterAnalysisSimpleThreeVehicleEvents, setFilterAnalysisSimpleThreeVehicleEvents] = useQueryState<string[]>('analysis_simple_three_vehicle_events', parseAsArrayOfStrings.withDefault([...RIDE_ANALYSIS_GRADE_OPTIONS, 'none']));
	const [filterAnalysisEndedAtLastStop, setFilterAnalysisEndedAtLastStop] = useQueryState<string[]>('analysis_ended_at_last_stop', parseAsArrayOfStrings.withDefault([...RIDE_ANALYSIS_GRADE_OPTIONS, 'none']));
	const [filterAnalysisExpectedApexValidationInterval, setFilterAnalysisExpectedApexValidationInterval] = useQueryState<string[]>('analysis_expected_apex_validation_interval', parseAsArrayOfStrings.withDefault([...RIDE_ANALYSIS_GRADE_OPTIONS, 'none']));
	const [filterAnalysisTransactionSequentiality, setFilterAnalysisTransactionSequentiality] = useQueryState<string[]>('analysis_transaction_sequentiality', parseAsArrayOfStrings.withDefault([...RIDE_ANALYSIS_GRADE_OPTIONS, 'none']));
	const [filterAcceptanceStatus, setFilterAcceptanceStatus] = useQueryState<string[]>('acceptance_status', parseAsArrayOfStrings.withDefault([...RideAcceptanceStatusSchema.options, 'none']));

	const [flagsLastUpdateState, setFlagsLastUpdateState] = useDebouncedState<null | UnixTimestamp>(null, 100);

	const [queryStringParams, setQueryStringParams] = useDebouncedState<null | string>(null, 500);

	const selectedRideId = useMemo(() => {
		const rideId = pathname.split('/rides/').pop()?.split('?').shift();
		if (!rideId) return undefined;
		return decodeURIComponent(rideId);
	}, [pathname]);

	//
	// B. Fetch data

	const { data: ridesData, error: ridesError, isLoading: ridesLoading } = useSWR<RideNormalized[], Error>(queryStringParams && `${API_ROUTES.controller.RIDES_LIST}?${queryStringParams}`);

	useEffect(() => {
		// This effect runs every time there is a change in the websocket reference,
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
		const eventData: HttpResponse<RideNormalized> = JSON.parse(event.data);
		// If the ride is not in the normalized data, return early
		if (!ridesData?.some(ride => ride._id === eventData.data._id)) return;
		// Normalize the ride data and update the state
		ridesData.push(eventData.data);
		setFlagsLastUpdateState(Dates.now('Europe/Lisbon').unix_timestamp);
	};

	//
	// C. Transform data

	useEffect(() => {
		const params = {
			agency_ids: filterAgency.join(','),
			date_end: filterDateEnd,
			date_start: filterDateStart,
			search: debouncedFilterSearch,
			/* * */
			acceptance_status: filterAcceptanceStatus.join(','),
			analysis_ended_at_last_stop_grade: filterAnalysisEndedAtLastStop.join(','),
			analysis_expected_apex_validation_interval: filterAnalysisExpectedApexValidationInterval.join(','),
			analysis_simple_three_vehicle_events_grade: filterAnalysisSimpleThreeVehicleEvents.join(','),
			analysis_transaction_sequentiality: filterAnalysisTransactionSequentiality.join(','),
			/* * */
			delay_statuses: filterDelayStatus.join(','),
			operational_statuses: filterOperationalStatus.join(','),
			/* * */
			line_ids: undefined,
			stop_ids: undefined,
		};
		const stringParams: Record<string, string> = Object.fromEntries(
			Object
				.entries(params)
				.filter(([, value]) => value !== undefined)
				.map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : String(value)]),
		);
		const result = new URLSearchParams(stringParams).toString();
		setQueryStringParams(result);
	}, [
		debouncedFilterSearch,
		filterAgency,
		filterDateStart,
		filterDateEnd,
		filterAcceptanceStatus,
		filterAnalysisEndedAtLastStop,
		filterAnalysisExpectedApexValidationInterval,
		filterAnalysisSimpleThreeVehicleEvents,
		filterAnalysisTransactionSequentiality,
		filterDelayStatus,
		filterOperationalStatus,
	]);

	//
	// D. Define context value

	const contextValue: RidesListContextState = useMemo(() => ({
		actions: {
			setFilterAcceptanceStatus,
			setFilterAgency,
			setFilterAnalysisEndedAtLastStop,
			setFilterAnalysisExpectedApexValidationInterval,
			setFilterAnalysisSimpleThreeVehicleEvents,
			setFilterAnalysisTransactionSequentiality,
			setFilterDateEnd,
			setFilterDateStart,
			setFilterDelayStatus,
			setFilterOperationalStatus,
			setFilterSearch,
		},
		data: {
			filtered: ridesData ?? [],
			selectedRideId,
		},
		filters: {
			acceptance_status: filterAcceptanceStatus,
			agency: filterAgency,
			analysis_ended_at_last_stop: filterAnalysisEndedAtLastStop,
			analysis_expected_apex_validation_interval: filterAnalysisExpectedApexValidationInterval,
			analysis_simple_three_vehicle_events_grade: filterAnalysisSimpleThreeVehicleEvents,
			analysis_transaction_sequentiality: filterAnalysisTransactionSequentiality,
			date_end: filterDateEnd,
			date_start: filterDateStart,
			delay_status: filterDelayStatus,
			operational_status: filterOperationalStatus,
			search: filterSearch,
		},
		flags: {
			error: ridesError,
			last_update: flagsLastUpdateState,
			loading: ridesLoading,
		},
	}), [
		ridesData,
		selectedRideId,
		filterAgency,
		filterDateEnd,
		filterDateStart,
		filterDelayStatus,
		filterOperationalStatus,
		filterSearch,
		filterAnalysisSimpleThreeVehicleEvents,
		filterAnalysisTransactionSequentiality,
		filterAnalysisExpectedApexValidationInterval,
		filterAcceptanceStatus,
		filterAnalysisEndedAtLastStop,
		flagsLastUpdateState,
		ridesLoading,
		ridesError,
	]);

	//
	// E. Render components

	return (
		<RidesListContext.Provider value={contextValue}>
			{children}
		</RidesListContext.Provider>
	);

	//
};
