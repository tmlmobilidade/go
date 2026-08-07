'use client';

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { CoordinatesInput, Section } from '@tmlmobilidade/ui';
import { useCallback } from 'react';

type Coords = [number | undefined, number | undefined];

/* * */

export function StopCreateStepLocationCoordinatesInput() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();
	const [latitude, longitude] = stopCreateContext.form.instance.getValues(['latitude', 'longitude']);

	//
	// B. Handle actions

	const handleSetCoordinates = useCallback(([lat, lng]: Coords) => {
		if (lat === undefined || lng === undefined) return;

		stopCreateContext.form.instance.setValue('latitude', lat);
		stopCreateContext.form.instance.setValue('longitude', lng);
	}, []);

	//
	// C. Render components

	return (
		<Section gap="md">
			<CoordinatesInput
				onChange={handleSetCoordinates}
				onDraftChange={handleSetCoordinates}
				value={[latitude, longitude]}
			/>
		</Section>
	);

	//
}
