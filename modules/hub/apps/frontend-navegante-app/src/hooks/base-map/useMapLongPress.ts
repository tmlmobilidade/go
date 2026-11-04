'use client';

import { type MapLayerMouseEvent, type MapLayerTouchEvent } from '@vis.gl/react-maplibre';
import { useCallback, useEffect, useRef } from 'react';

/* * */

const MAP_LONG_PRESS_DELAY_MS = 550;
const MAP_LONG_PRESS_MOVE_TOLERANCE_PX = 8;
const MAP_LONG_PRESS_CLICK_WINDOW_MS = 750;

interface MapPressPoint {
	x: number
	y: number
}

export interface MapLongPressLocation {
	latitude: number
	longitude: number
}

/* * */

export function useMapLongPress(onLongPress: (location: MapLongPressLocation) => void) {
	//

	//
	// A. Setup variables

	const longPressStartPointRef = useRef<MapPressPoint | null>(null);
	const longPressTimerRef = useRef<null | ReturnType<typeof setTimeout>>(null);
	const longPressTriggeredAtRef = useRef<null | number>(null);

	//
	// B. Handle actions

	const cancel = useCallback(() => {
		if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
		longPressTimerRef.current = null;
		longPressStartPointRef.current = null;
	}, []);

	const handlePressStart = useCallback((event: MapLayerMouseEvent | MapLayerTouchEvent) => {
		if ('button' in event.originalEvent && event.originalEvent.button !== 0) return;
		if ('touches' in event.originalEvent && event.originalEvent.touches.length !== 1) return;

		cancel();
		longPressTriggeredAtRef.current = null;
		longPressStartPointRef.current = { x: event.point.x, y: event.point.y };

		const latitude = Number(event.lngLat.lat.toFixed(6));
		const longitude = Number(event.lngLat.lng.toFixed(6));

		longPressTimerRef.current = setTimeout(() => {
			longPressTimerRef.current = null;
			longPressStartPointRef.current = null;
			longPressTriggeredAtRef.current = Date.now();
			onLongPress({ latitude, longitude });

			if ('vibrate' in navigator) navigator.vibrate(10);
		}, MAP_LONG_PRESS_DELAY_MS);
	}, [cancel, onLongPress]);

	const handlePressMove = useCallback((event: MapLayerMouseEvent | MapLayerTouchEvent) => {
		if (!longPressStartPointRef.current) return;

		const horizontalDistance = event.point.x - longPressStartPointRef.current.x;
		const verticalDistance = event.point.y - longPressStartPointRef.current.y;
		const distance = Math.hypot(horizontalDistance, verticalDistance);

		if (distance > MAP_LONG_PRESS_MOVE_TOLERANCE_PX) cancel();
	}, [cancel]);

	const consumeTriggeredClick = useCallback(() => {
		const triggeredAt = longPressTriggeredAtRef.current;
		longPressTriggeredAtRef.current = null;

		return triggeredAt !== null && Date.now() - triggeredAt <= MAP_LONG_PRESS_CLICK_WINDOW_MS;
	}, []);

	useEffect(() => cancel, [cancel]);

	return {
		cancel,
		consumeTriggeredClick,
		handlePressMove,
		handlePressStart,
	};

	//
}
