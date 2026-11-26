'use client';

import { type MapLayerMouseEvent } from '@vis.gl/react-maplibre';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/* * */

const POPUP_CLOSE_DELAY_MS = 300;

interface UseLandingVehicleSelectionReturnType {
	cancelClose: () => void
	handleClick: (event: MapLayerMouseEvent) => void
	handleMouseMove: (event: MapLayerMouseEvent) => void
	scheduleClose: () => void
	vehicleKey: null | string
}

/* * */

function getVehicleKey(event: MapLayerMouseEvent): null | string {
	// MapLibre limits event.features to the configured interactive vehicle layers.
	const properties = event.features?.[0]?.properties;
	return properties ? `${properties.agency_id}-${properties.vehicle_id}` : null;
}

/* * */

export function useLandingVehicleSelection(): UseLandingVehicleSelectionReturnType {
	//
	// A. Setup variables

	const [vehicleKey, setVehicleKey] = useState<null | string>(null);
	const pinned = useRef(false);
	const closeTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => () => clearTimeout(closeTimeout.current), []);

	//
	// B. Handle actions

	const cancelClose = useCallback(() => clearTimeout(closeTimeout.current), []);
	const scheduleClose = useCallback(() => {
		if (pinned.current) return;
		clearTimeout(closeTimeout.current);
		closeTimeout.current = setTimeout(() => setVehicleKey(null), POPUP_CLOSE_DELAY_MS);
	}, []);

	const handleClick = useCallback((event: MapLayerMouseEvent) => {
		if (event.originalEvent.target instanceof Element && event.originalEvent.target.closest('.maplibregl-popup')) return;
		cancelClose();
		const key = getVehicleKey(event);
		pinned.current = key !== null;
		setVehicleKey(key);
	}, [cancelClose]);

	const handleMouseMove = useCallback((event: MapLayerMouseEvent) => {
		if (pinned.current || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
		const key = getVehicleKey(event);
		if (!key) return;
		cancelClose();
		setVehicleKey(key);
	}, [cancelClose]);

	//
	// C. Return state

	return useMemo(() => ({ cancelClose, handleClick, handleMouseMove, scheduleClose, vehicleKey }), [cancelClose, handleClick, handleMouseMove, scheduleClose, vehicleKey]);
}
