'use client';

/* * */

import { useOperationalDateContext } from '@/contexts/OperationalDate.context';
import { getDelayStatus } from '@/utils/get-delay-status';
import { getOperationalStatus } from '@/utils/get-operational-status';
import { getSeenStatus } from '@/utils/get-seen-status';
import { getStartTime } from '@/utils/get-start-time';
import { type Ride, type RideAnalysis } from '@tmlmobilidade/core/types';
import { getUnixTimestamp } from '@tmlmobilidade/core/utils';
import { type RidesExplorerWebSocketMessage, type RidesExplorerWebSocketMessageConfig } from '@tmlmobilidade/sae-sla-pckg-utils';
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
		getRideById: (rideId: string) => Ride | undefined
	}
	counters: {
		current_items: number
		total_items: number
	}
	data: {
		rides_display: ExtendedRideDisplay[]
		rides_store: Map<string, Ride>
	}
	flags: {
		is_loading: boolean
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

	const dataRidesStoreState = useRef<Map<string, Ride>>(new Map());
	const [dataRidesDisplayState, setDataRidesDisplayState] = useState<ExtendedRideDisplay[]>([]);

	const [counterTotalItems, setCounterTotalItems] = useState<number>(0);

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
		webSocketRef.current = new WebSocket('ws://localhost:5050/rides');
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
			dataRidesStoreState.current.clear();
			setDataRidesDisplayState([]);
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
			setCounterTotalItems(configMessageData.total_items);
			return;
		}

		//
		// Handle the 'data' response message

		if (messageData.action === 'data') {
			const rideData = messageData.data as Ride;
			if (rideData.operational_date !== operationalDateContext.data.selected_date) return;
			// console.log(operationalDateContext.data.selected_date);
			dataRidesStoreState.current.set(rideData._id, rideData);
			return;
		}

		console.log('Unknown message:', messageData);

		//
	};

	useEffect(() => {
		const refreshList = () => {
			const allRidesDisplay: ExtendedRideDisplay[] = Array
				.from(dataRidesStoreState.current.values())
				.sort((a, b) => String(a.start_time_scheduled).localeCompare(String(b.start_time_scheduled)))
				.map((item) => {
					return {
						...item,
						delay_status: getDelayStatus(item.start_time_scheduled, item.start_time_observed),
						operational_status: getOperationalStatus(item.start_time_scheduled, item.seen_last_at),
						seen_status: getSeenStatus(item.seen_last_at),
						simple_three_vehicle_events_grade: item.analysis.find(analysis => analysis._id === 'SIMPLE_THREE_VEHICLE_EVENTS')?.grade || null,
						start_time_observed_display: item.start_time_observed ? getStartTime(item.start_time_observed) : null,
						start_time_scheduled_display: getStartTime(item.start_time_scheduled),
					};
				});
			setDataRidesDisplayState(allRidesDisplay);
		};
		const interval = setInterval(refreshList, 1000);
		return () => clearInterval(interval);
	}, [dataRidesStoreState.current]);

	const getRideById = (rideId: string): Ride | undefined => {
		console.log('dataRidesStoreState.current.size', dataRidesStoreState.current.size);
		return dataRidesStoreState.current.get(rideId);
	};

	//
	// D. Define context value

	const contextValue: RidesContextState = useMemo(() => ({
		actions: {
			getRideById,
		},
		counters: {
			current_items: dataRidesDisplayState.length,
			total_items: counterTotalItems,
		},
		data: {
			rides_display: dataRidesDisplayState,
			rides_store: dataRidesStoreState.current,
		},
		flags: {
			is_loading: dataRidesStoreState.current.size !== counterTotalItems,
		},
	}), [dataRidesDisplayState, counterTotalItems, dataRidesStoreState.current]);

	//
	// E. Render components

	return (
		<RidesContext.Provider value={contextValue}>
			{children}
		</RidesContext.Provider>
	);

	//
};
