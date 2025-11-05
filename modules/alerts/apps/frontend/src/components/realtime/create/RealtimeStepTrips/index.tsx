'use client';

/* * */

import { Section, Separator } from '@go/ui';

import { RealtimeStepTripsFilters } from '../RealtimeStepTripsFilters';
import { RealtimeStepTripsFound } from '../RealtimeStepTripsFound';
import { RealtimeStepTripsSelected } from '../RealtimeStepTripsSelected';

/* * */

export function RealtimeStepTrips() {
	return (
		<Section flexDirection="column" gap="sm">
			<RealtimeStepTripsFilters />
			<RealtimeStepTripsFound />

			<Separator separatorType="dashed" />

			<RealtimeStepTripsSelected />
		</Section>
	);
}
