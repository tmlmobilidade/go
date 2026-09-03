'use client';

/* * */

import { StopsCreateStepLocationCoordinatesInput } from '@/components/stops/create/StopsCreateStepLocationCoordinatesInput';
import { StopsCreateStepLocationDetails } from '@/components/stops/create/StopsCreateStepLocationDetails';
import { StopsCreateStepLocationMap } from '@/components/stops/create/StopsCreateStepLocationMap';
import { Divider } from '@tmlmobilidade/ui';

/* * */

export function StopsCreateStepLocation() {
	return (
		<>
			<StopsCreateStepLocationMap />
			<Divider />
			<StopsCreateStepLocationCoordinatesInput />
			<StopsCreateStepLocationDetails />
		</>
	);
}
