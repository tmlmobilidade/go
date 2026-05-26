'use client';

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { CoordinatesInput, Section } from '@tmlmobilidade/ui';

/* * */

export function StopCreateStep1Coordinates() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();

	//
	// B. Handle actions

	const handleSetCoordinates = (value: [number, number]) => {
		stopCreateContext.actions.setLatLng(value[0], value[1]);
	};

	//
	// C. Render components

	return (
		<Section gap="md">
			<CoordinatesInput
				key={stopCreateContext.data.form.key('coordinates')}
				onChange={handleSetCoordinates}
				value={[stopCreateContext.data.form.values.latitude, stopCreateContext.data.form.values.longitude]}
			/>
		</Section>
	);

	//
}
