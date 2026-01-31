'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type RideNormalized, type UnixTimestamp } from '@tmlmobilidade/types';
import { type HttpResponse } from '@tmlmobilidade/utils';
import { useEffect, useRef } from 'react';
import useSWR from 'swr';

/* * */

export interface UseRidesWebsocketOptions {
	queryStringParams: null | string
}

/* * */

export function useRidesWebsocket({ queryStringParams }: UseRidesWebsocketOptions) {
	//

	//
	// A. Setup variables

	const webSocketRef = useRef<null | WebSocket>(null);

	//
	// B. Fetch data

	const { data: ridesBatch, error: ridesError, isLoading: ridesLoading } = useSWR<RideNormalized[], Error>(queryStringParams && `${API_ROUTES.controller.RIDES_LIST}?${queryStringParams}`, { refreshInterval: 300_000 });

	//
	// C. Transform data

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
	}, [enabled, mutateRides, setLastUpdate]);
}
