'use client';

/* * */

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { useDebouncedState, useDebouncedValue } from '@mantine/hooks';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { PermissionCatalog, type RideNormalized } from '@tmlmobilidade/types';
import { DelayStatusSchema, OperationalStatusSchema } from '@tmlmobilidade/types';
import { RIDE_ANALYSIS_GRADE_OPTIONS, RideAcceptanceStatusSchema, type UnixTimestamp } from '@tmlmobilidade/types';
import { parseAsArrayOfStrings, useDataAgencies } from '@tmlmobilidade/ui';
import { HttpResponse } from '@tmlmobilidade/utils';
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

	const agenciesContext = useAgenciesContext();

	//
	// B. Fetch data

	const { filteredIds: filteredAgencyIds, options: filteredAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.rides.actions.analysis_read],
		scope: PermissionCatalog.all.rides.scope,
	});

	//
	// B. Setup filters

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

	//
	// B. Fetch data

	const { data: ridesData, error: ridesError, isLoading: ridesLoading, mutate: mutateRides } = useSWR<RideNormalized[], Error>(queryStringParams && `${API_ROUTES.controller.RIDES_LIST}?${queryStringParams}`, { refreshInterval: 300_000 });

	const webSocketRef = useRef<null | WebSocket>(null);

	useEffect(() => {
		if (webSocketRef.current) return;

		console.log('Opening WebSocket connection...');
		const wsUrl = new URL(API_ROUTES.controller.RIDES_WS);
		wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:';
		const socket = new WebSocket(wsUrl.toString());
		webSocketRef.current = socket;

		const handleWebsocketInit = () => {
			if (!webSocketRef.current) return;
			if (webSocketRef.current.readyState !== webSocketRef.current.OPEN) return;
			webSocketRef.current.send('init');
		};

		const handleIncomingMessage = (event: MessageEvent<string>) => {
			try {
				const eventData: HttpResponse<RideNormalized> = JSON.parse(event.data);
				console.log('eventData:', eventData.data._id);
				// mutateRides((current) => {
				// 	if (!current) return current;
				// 	const index = current.findIndex(ride => ride._id === eventData.data._id);
				// 	if (index === -1) return current;
				// 	const next = [...current];
				// 	next[index] = eventData.data;
				// 	return next;
				// });
				// setLastUpdate(Dates.now('Europe/Lisbon').unix_timestamp);
				// console.log('Received ride update via WebSocket:', eventData.data._id);
			}
			catch (error) {
				console.error('WebSocket message parse error:', error);
			}
		};

		const handleWebsocketError = (event: Event) => {
			console.error('WebSocket error:', event);
		};

		const handleWebsocketClose = (event: CloseEvent) => {
			console.warn('WebSocket closed:', event.code, event.reason);
		};

		socket.addEventListener('open', handleWebsocketInit);
		socket.addEventListener('message', handleIncomingMessage);
		socket.addEventListener('error', handleWebsocketError);
		socket.addEventListener('close', handleWebsocketClose);

		return () => {
			socket.removeEventListener('open', handleWebsocketInit);
			socket.removeEventListener('message', handleIncomingMessage);
			socket.removeEventListener('error', handleWebsocketError);
			socket.removeEventListener('close', handleWebsocketClose);
			socket.close();
			webSocketRef.current = null;
		};
	}, [mutateRides]);

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
