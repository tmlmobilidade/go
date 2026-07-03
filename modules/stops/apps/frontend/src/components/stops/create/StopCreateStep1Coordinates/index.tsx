'use client';

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { isValidLatitude, isValidLongitude } from '@tmlmobilidade/geo';
import { CoordinatesInput, Section } from '@tmlmobilidade/ui';
import { useCallback, useRef } from 'react';

type Coords = [number | undefined, number | undefined];

/* * */

export function StopCreateStep1Coordinates() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();
	const [latitude, longitude] = stopCreateContext.data.coordinates;
	const setLatLngRef = useRef(stopCreateContext.actions.setLatLng);
	setLatLngRef.current = stopCreateContext.actions.setLatLng;

	//
	// B. Handle actions

	const handleSetCoordinates = useCallback((value: Coords | undefined) => {
		if (!value) return;

		const [lat, lng] = value;
		if (lat === undefined || lng === undefined) return;

		const validatedLatitude = isValidLatitude(lat);
		const validatedLongitude = isValidLongitude(lng);

		setLatLngRef.current(
			validatedLatitude || lat,
			validatedLongitude || lng,
		);
	}, []);

	//
	// C. Render components

	const value: Coords | undefined = latitude === undefined && longitude === undefined
		? undefined
		: [latitude, longitude];

	return (
		<Section gap="md">
			<CoordinatesInput
				onChange={handleSetCoordinates}
				value={value}
			/>
		</Section>
	);

	//
}
