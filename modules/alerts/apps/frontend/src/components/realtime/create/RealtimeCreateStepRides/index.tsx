'use client';

/* * */

import { Section, Separator } from '@tmlmobilidade/ui';

import { RealtimeCreateStepRidesFilters } from '../RealtimeCreateStepRidesFilters';
import { RealtimeCreateStepRidesFound } from '../RealtimeCreateStepRidesFound';
import { RealtimeCreateStepRidesSelected } from '../RealtimeCreateStepRidesSelected';

/* * */

export function RealtimeCreateStepRides() {
	return (
		<Section flexDirection="column" gap="sm">
			<RealtimeCreateStepRidesFilters />
			<RealtimeCreateStepRidesFound />

			<Separator separatorType="dashed" />

			<RealtimeCreateStepRidesSelected />
		</Section>
	);
}
