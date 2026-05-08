'use client';

import { Dates } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';
import { normalizeRide } from '@tmlmobilidade/normalizers';
import { type GetRidesBatchQuery, type RideNormalized, type UnixTimestamp } from '@tmlmobilidade/types';
import { type SelectDataItem, useDebouncedState, useStateRef } from '@tmlmobilidade/ui';
import { type HttpResponse } from '@tmlmobilidade/utils';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

// Module-level WebSocket connection pool
// shared across all hook instances for the same URL.
const wsInstances = new Map<string, WebSocket>();
const wsListeners = new Map<string, Set<(event: MessageEvent<string>) => void>>();

function subscribeToWebSocket(wsUrlString: string, onMessage: (event: MessageEvent<string>) => void) {
	// Skip if URL is invalid
	if (!wsUrlString) return () => {};
	// Open a new WebSocket connection if one doesn't exist for the URL
	Logger.info(`Opening WebSocket connection... ${wsUrlString}`);
	const socket = new WebSocket(wsUrlString);
	const listeners = new Set<(event: MessageEvent<string>) => void>();
	wsListeners.set(wsUrlString, listeners);

	socket.addEventListener('open', () => {
		if (socket.readyState === WebSocket.OPEN) socket.send('init');
	});
	socket.addEventListener('message', (event: MessageEvent<string>) => {
		listeners.forEach(fn => fn(event));
	});
	socket.addEventListener('error', (event: Event) => {
		// eslint-disable-next-line no-console
		console.warn('WebSocket error:', event);
	});
	socket.addEventListener('close', (event: CloseEvent) => {
		Logger.info(`WebSocket closed: ${event.code}, ${event.reason}`);
		wsInstances.delete(wsUrlString);
		wsListeners.delete(wsUrlString);
	});

	wsInstances.set(wsUrlString, socket);

	wsListeners.get(wsUrlString).add(onMessage);

	return () => {
		wsListeners.get(wsUrlString)?.delete(onMessage);
		if (wsListeners.get(wsUrlString)?.size === 0) {
			wsInstances.get(wsUrlString)?.close();
		}
	};
}

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

	const [queryStringParams, setQueryStringParams] = useDebouncedState<null | string>(null, 500);

	const [lastUpdatedAt, setLastUpdatedAt] = useState<null | UnixTimestamp>(null);

	const ridesData = useStateRef<RideNormalized[]>([]);

	//
	// B. Fetch data

	const { data: fetchedRidesData, error: fetchedRidesError, isLoading: fetchedRidesLoading } = useSWR<RideNormalized[], Error>((apiUrl && queryStringParams) && `${apiUrl}?${queryStringParams}`);

	useEffect(() => {
		// Create WebSocket URL based on API URL
		const wsUrl = new URL(`${apiUrl}/ws`);
		wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:';
		// Setup a handler for incoming WebSocket messages
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
		// Subscribe to WebSocket messages and return an unsubscribe function
		return subscribeToWebSocket(wsUrl.toString(), handleIncomingMessage);
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
