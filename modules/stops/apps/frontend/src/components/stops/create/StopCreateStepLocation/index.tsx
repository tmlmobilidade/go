'use client';

/* * */

import { StopCreateStepLocationCoordinatesInput } from './components/StopCreateStepLocationCoordinatesInput';
import { StopCreateStepLocationLocationsCards } from './components/StopCreateStepLocationLocationsCards';
import { StopCreateStepLocationMap } from './components/StopCreateStepLocationMap';

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
