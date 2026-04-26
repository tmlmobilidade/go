'use client';

/* * */

import { Dates } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';
import { normalizeRide } from '@tmlmobilidade/normalizers';
import { type GetRidesBatchQuery, type RideNormalized, type UnixTimestamp } from '@tmlmobilidade/types';
import { type SelectDataItem, useDebouncedState, useStateRef } from '@tmlmobilidade/ui';
import { type HttpResponse } from '@tmlmobilidade/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';

/* * */

interface UseDataRidesProps {
	filters: GetRidesBatchQuery
}

/* * */

interface UseDataRidesReturnType {
	error: Error | undefined
	isLoading: boolean
	lastUpdatedAt: null | UnixTimestamp
	options: SelectDataItem[]
	raw: RideNormalized[]
}

/* * */

export function useDataRides(apiUrl: string, props?: UseDataRidesProps): UseDataRidesReturnType {
	//

	//
	// A. Setup variables

	const webSocketRef = useRef<null | WebSocket>(null);

	const [queryStringParams, setQueryStringParams] = useDebouncedState<null | string>(null, 500);

	const [lastUpdatedAt, setLastUpdatedAt] = useState<null | UnixTimestamp>(null);

	const ridesData = useStateRef<RideNormalized[]>([]);

	//
	// B. Fetch data

	const { data: fetchedRidesData, error: fetchedRidesError, isLoading: fetchedRidesLoading } = useSWR<RideNormalized[], Error>((apiUrl && queryStringParams) && `${apiUrl}?${queryStringParams}`);

	useEffect(() => {
		// Skip if webSocket is already initialized
		if (webSocketRef.current) return;
		// Initialize WebSocket connection
		Logger.info(`Opening WebSocket connection... ${apiUrl}/ws`);
		const wsUrl = new URL(`${apiUrl}/ws`);
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
				const foundRide = ridesData.ref.current.some(ride => ride._id === eventData.data._id);
				// console.log('WebSocket message received:', foundRide, eventData.data._id);
				if (!foundRide) return;
				if (!ridesData.ref.current) return;
				const index = ridesData.ref.current.findIndex(ride => ride._id === eventData.data._id);
				if (index === -1) return ridesData.ref.current;
				const next = [...ridesData.ref.current];
				next[index] = eventData.data;
				// Trigger data update
				ridesData.set(next);
				setLastUpdatedAt(Dates.now('Europe/Lisbon').unix_timestamp);
			} catch (error) {
				Logger.error('WebSocket message parse error:', error);
			}
		};

		const handleWebsocketError = (event: Event) => {
			// eslint-disable-next-line no-console
			console.error('WebSocket error:', event);
		};

		const handleWebsocketClose = (event: CloseEvent) => {
			Logger.info(`WebSocket closed: ${event.code}, ${event.reason}`);
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
	}, []);

	//
	// C. Transform data

	useEffect(() => {
		ridesData.set(fetchedRidesData ?? []);
		setLastUpdatedAt(Dates.now('Europe/Lisbon').unix_timestamp);
	}, [fetchedRidesData]);

	useEffect(() => {
		const interval = setInterval(() => {
			const normalizedRidesData = ridesData.ref.current.map(item => normalizeRide(item));
			ridesData.set(normalizedRidesData);
		}, 1_000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		// Skip if no filters are set
		if (!props?.filters) return;
		// Skip if required filters are missing
		if (!props.filters.date_start) return;
		if (!props.filters.date_end) return;
		if (!props.filters.agency_ids?.length) return;
		// Parse filters into a query string format
		const filtersMap = Object
			.entries(props.filters)
			.filter(([, value]) => value !== undefined)
			.map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : String(value)]);
		// Build query string params and set state
		const result = new URLSearchParams(Object.fromEntries(filtersMap)).toString();
		setQueryStringParams(result);
	}, [props.filters]);

	const optionsData = useMemo(() => {
		if (!ridesData.state) return [];
		return ridesData.state.map(ride => ({
			label: ride.headsign,
			value: ride.trip_id,
		}));
	}, [ridesData.state]);
	//
	// D. Return data

	return {
		error: fetchedRidesError,
		isLoading: fetchedRidesLoading,
		lastUpdatedAt: lastUpdatedAt,
		options: optionsData,
		raw: ridesData.state ?? [],
	};

	//
};
