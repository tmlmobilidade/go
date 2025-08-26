'use client';

/* * */

import { useStopCreateContext } from '@/contexts/StopCreate.context';
import { CoordinatesInput, Section } from '@tmlmobilidade/ui';

/* * */

export function CreateStopStep1Coordinates() {
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
				onChange={handleSetCoordinates}
				value={[stopCreateContext.data.form.values.latitude, stopCreateContext.data.form.values.longitude]}
			/>
		</Section>
	);

	//
}
