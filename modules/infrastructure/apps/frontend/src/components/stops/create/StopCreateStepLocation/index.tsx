'use client';

/* * */

import { StopCreateStepLocationCoordinatesInput } from '@/components/stops/create/StopCreateStepLocationCoordinatesInput';
import { StopCreateStepLocationLocationsCards } from '@/components/stops/create/StopCreateStepLocationLocationsCards';
import { StopCreateStepLocationMap } from '@/components/stops/create/StopCreateStepLocationMap';

/* * */

export function StopCreateStepLocation() {
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
