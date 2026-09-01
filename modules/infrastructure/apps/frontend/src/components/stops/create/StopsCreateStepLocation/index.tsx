'use client';

/* * */

import { StopsCreateStepLocationCoordinatesInput } from '@/components/stops/create/StopsCreateStepLocationCoordinatesInput';
import { StopsCreateStepLocationDetails } from '@/components/stops/create/StopsCreateStepLocationDetails';
import { StopsCreateStepLocationMap } from '@/components/stops/create/StopsCreateStepLocationMap';

/* * */

export function StopsCreateStepLocation() {
	return (
		<>
			<StopsCreateStepLocationMap />
			<StopsCreateStepLocationCoordinatesInput />
			<StopsCreateStepLocationDetails />
		</>
	);
}
