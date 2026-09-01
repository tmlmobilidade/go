'use client';

/* * */

import { StopCreateStepLocationCoordinatesInput } from '@/components/stops/create/StopCreateStepLocationCoordinatesInput';
import { StopCreateStepLocationLocationsCards } from '@/components/stops/create/StopCreateStepLocationLocationsCards';
import { StopCreateStepLocationMap } from '@/components/stops/create/StopCreateStepLocationMap';

/* * */

export function StopsCreateStepLocation() {
	//

	//
	// A. Render components

	return (
		<>
			<StopCreateStepLocationMap />
			<StopCreateStepLocationCoordinatesInput />
			<StopCreateStepLocationLocationsCards />
		</>
	);
}
