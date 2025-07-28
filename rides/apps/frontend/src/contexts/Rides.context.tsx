'use client';

/* * */

import { type RideNormalized } from '@/types/normalized';
import { getRideNormalized } from '@/utils/get-ride-normalized';
import { useDebouncedState } from '@mantine/hooks';
import { type Ride, type UnixTimestamp } from '@tmlmobilidade/types';
import { Dates, type HttpResponse, swrFetcher } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';

/* * */

interface RidesContextState {
	actions: {
		getRideById: (rideId: string) => RideNormalized | undefined
	}
	data: {
		normalized: RideNormalized[]
		normalized_map: Map<string, RideNormalized>
	}
	flags: {
		error: Error | null
		last_update: null | UnixTimestamp
		loading: boolean
	}
}

/* * */

const RidesContext = createContext<RidesContextState | undefined>(undefined);

export function useRidesContext() {
	const context = useContext(RidesContext);
	if (!context) {
		throw new Error('useRidesContext must be used within a RidesContextProvider');
	}
	return context;
}

/* * */

export const RidesContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const webSocketRef = useRef<null | WebSocket>(null);

	const dataRidesNormalizedMap = useRef<Map<string, RideNormalized> | null>(new Map());

	const [dataRidesNormalized, setDataRidesNormalized] = useState<RideNormalized[]>([]);
	const [flagsLastUpdateState, setFlagsLastUpdateState] = useDebouncedState<null | UnixTimestamp>(null, 100);

	//
	// B. Fetch data

	const { data: ridesBatchData, error: ridesBatchError, isLoading: ridesBatchLoading } = useSWR<HttpResponse<Ride[]>>('/api/rides', swrFetcher);

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
		if (!dataRidesNormalizedMap.current.has(eventData.data._id)) return;
		// Normalize the ride data and update the state
		const normalized = getRideNormalized(eventData.data);
		dataRidesNormalizedMap.current.set(eventData.data._id, normalized);
		setFlagsLastUpdateState(Dates.now('Europe/Lisbon').unix_timestamp);
	};

	//
	// C. Transform data

	useEffect(() => {
		if (ridesBatchLoading || !ridesBatchData?.data) return;
		const ridesMap = new Map<string, RideNormalized>();
		ridesBatchData.data.forEach((item) => {
			const normalized = getRideNormalized(item);
			ridesMap.set(normalized._id, normalized);
		});
		dataRidesNormalizedMap.current = ridesMap;
		setFlagsLastUpdateState(Dates.now('Europe/Lisbon').unix_timestamp);
	}, [ridesBatchData, ridesBatchLoading, setFlagsLastUpdateState]);

	useEffect(() => {
		const refreshCatalog = () => {
			const result: RideNormalized[] = Array
				.from(dataRidesNormalizedMap.current.values())
				.sort((a, b) => a.start_time_scheduled - b.start_time_scheduled)
				.map(item => getRideNormalized(item));
			setDataRidesNormalized(result);
		};
		const interval = setInterval(refreshCatalog, 1000);
		return () => clearInterval(interval);
	}, [dataRidesNormalizedMap]);

	//
	// C. Handle actions

	const getRideById = (rideId: string): RideNormalized | undefined => {
		return dataRidesNormalizedMap.current.get(rideId);
	};

	//
	// D. Define context value

	const contextValue: RidesContextState = useMemo(() => ({
		actions: {
			getRideById,
		},
		data: {
			normalized: dataRidesNormalized,
			normalized_map: dataRidesNormalizedMap.current,
		},
		flags: {
			error: ridesBatchError || null,
			last_update: flagsLastUpdateState,
			loading: ridesBatchLoading,
		},
	}), [
		flagsLastUpdateState,
		dataRidesNormalized,
	]);

	//
	// E. Render components

	return (
		<RidesContext.Provider value={contextValue}>
			{children}
		</RidesContext.Provider>
	);

	//
};
