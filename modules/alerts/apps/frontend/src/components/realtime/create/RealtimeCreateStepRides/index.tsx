'use client';

/* * */

import { RealtimeCreateStepRidesFilters } from '@/components/realtime/create/RealtimeCreateStepRidesFilters';
import { RealtimeCreateStepRidesFound } from '@/components/realtime/create/RealtimeCreateStepRidesFound';
import { RealtimeCreateStepRidesSelected } from '@/components/realtime/create/RealtimeCreateStepRidesSelected';
import { Divider, Section } from '@tmlmobilidade/ui';

/* * */

export function RealtimeCreateStepRides() {
	return (
		<Section padding="none">
			<RealtimeCreateStepRidesFilters />
			<Divider />
			<RealtimeCreateStepRidesFound />
			<RealtimeCreateStepRidesSelected />
		</Section>
	);
}
