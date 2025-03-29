'use client';

/* * */

import { useOperationalDateContext } from '@/contexts/OperationalDate.context';
import { getDelayStatus } from '@/utils/get-delay-status';
import { getOperationalStatus } from '@/utils/get-operational-status';
import { getSeenStatus } from '@/utils/get-seen-status';
import { getStartTime } from '@/utils/get-start-time';
import { useDebouncedState } from '@mantine/hooks';
import { type Ride, type RideAnalysis, UnixTimestamp } from '@tmlmobilidade/core/types';
import { getUnixTimestamp } from '@tmlmobilidade/core/utils';
import { type RidesExplorerWebSocketMessage, type RidesExplorerWebSocketMessageConfig } from '@tmlmobilidade/sae-controller-pckg-utils';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';

/* * */

export interface ExtendedRideDisplay extends Ride {
	delay_status: 'delayed' | 'early' | 'ontime' | null
	operational_status: 'ended' | 'missed' | 'running' | 'scheduled'
	seen_status: 'gone' | 'seen' | 'unseen'
	simple_three_vehicle_events_grade: RideAnalysis['grade']
	start_time_observed_display: null | string
	start_time_scheduled_display: string
}

interface RidesContextState {
	actions: {
		getRideById: (rideId: string) => ExtendedRideDisplay | undefined
	}
	data: {
		expected_items: number
		last_update: UnixTimestamp
		rides: Map<string, ExtendedRideDisplay>
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

	const operationalDateContext = useOperationalDateContext();

	const webSocketRef = useRef<null | WebSocket>(null);

	const dataRidesRef = useRef<Map<string, ExtendedRideDisplay>>(new Map());

	const [dataExpectedItemsState, setDataExpectedItemsState] = useState<number>();
	const [dataLastUpdateState, setDataLastUpdateState] = useDebouncedState<null | UnixTimestamp>(null, 100);

	//
	// B. Fetch data

	useEffect(() => {
		// This effect runs everytime there is a change in the websocket reference,
		// as the goal is to always maintain an open connection. If the connection is
		// already open, there is no need to open a new one, so return early.
		// If the connection is not open, then try to open a new one.
		if (webSocketRef.current) return;
		// Open a new WebSocket connection
		console.log('Opening WebSocket connection...');
		webSocketRef.current = new WebSocket(process.env.NODE_ENV === 'development' ? 'ws://localhost:52002/rides' : 'wss://controller.sae.carrismetropolitana.pt/api/rides');
		// webSocketRef.current = new WebSocket('wss://controller.sae.carrismetropolitana.pt/api/rides');
		webSocketRef.current.addEventListener('open', handleConfigChangeRequest);
		// Cleanup on unmount
		return () => {
			webSocketRef.current.removeEventListener('open', handleConfigChangeRequest);
			webSocketRef.current.close();
			webSocketRef.current = null;
		};
	}, []);

	useEffect(() => {
		// This effect runs everytime there is a change in the operational date context,
		// as the goal is to always send a new configuration message to the server when
		// the operational date changes. This is done to ensure that the server is always
		// aware of the client's current operational date.
		handleConfigChangeRequest();
		webSocketRef.current.addEventListener('message', handleIncomingMessage);
		return () => {
			dataRidesRef.current.clear();
			if (!webSocketRef.current) return;
			webSocketRef.current.removeEventListener('message', handleIncomingMessage);
		};
	}, [operationalDateContext.data.selected_date, webSocketRef.current?.readyState]);

	//
	// C. Handle actions

	const handleSendMessage = (message: RidesExplorerWebSocketMessage<RidesExplorerWebSocketMessageConfig>) => {
		if (!webSocketRef.current) return;
		if (webSocketRef.current.readyState !== webSocketRef.current.OPEN) return;
		webSocketRef.current.send(JSON.stringify(message));
	};

	const handleConfigChangeRequest = () => {
		handleSendMessage({
			action: 'config',
			operational_date: operationalDateContext.data.selected_date,
			sender: 'client',
			timestamp: getUnixTimestamp(),
		});
	};

	const handleIncomingMessage = (event: MessageEvent) => {
		//

		//
		// Before any specific action,
		// try to decode and validate the message.

		const messageData: RidesExplorerWebSocketMessage = JSON.parse(event.data);

		//
		// Handle the 'config' response message

		if (messageData.action === 'config') {
			const configMessageData = messageData.data as RidesExplorerWebSocketMessageConfig;
			setDataExpectedItemsState(configMessageData.total_items);
			return;
		}

		//
		// Handle the 'data' response message

		if (messageData.action === 'data') {
			const rideData = messageData.data as Ride;
			if (rideData.operational_date !== operationalDateContext.data.selected_date) return;
			dataRidesRef.current.set(rideData._id, {
				...rideData,
				delay_status: getDelayStatus(rideData.start_time_scheduled, rideData.start_time_observed),
				operational_status: getOperationalStatus(rideData.start_time_scheduled, rideData.seen_last_at),
				seen_status: getSeenStatus(rideData.seen_last_at),
				simple_three_vehicle_events_grade: rideData.analysis.find(analysis => analysis._id === 'SIMPLE_THREE_VEHICLE_EVENTS')?.grade || null,
				start_time_observed_display: rideData.start_time_observed ? getStartTime(rideData.start_time_observed) : null,
				start_time_scheduled_display: getStartTime(rideData.start_time_scheduled),
			});
			setDataLastUpdateState(getUnixTimestamp());
			return;
		}

		console.log('Unknown message:', messageData);

		//
	};

	const getRideById = (rideId: string): ExtendedRideDisplay | undefined => {
		return dataRidesRef.current.get(rideId);
	};

	//
	// D. Define context value

	const contextValue: RidesContextState = useMemo(() => ({
		actions: {
			getRideById,
		},
		data: {
			expected_items: dataExpectedItemsState,
			last_update: dataLastUpdateState,
			rides: dataRidesRef.current,
		},
	}), [dataExpectedItemsState, dataLastUpdateState, dataRidesRef.current]);

	//
	// E. Render components

	return (
		<RidesContext.Provider value={contextValue}>
			{children}
		</RidesContext.Provider>
	);

	//
};
