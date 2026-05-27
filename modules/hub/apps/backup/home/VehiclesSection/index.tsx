'use client';

import { Section } from '@/components/layout/Section';
import { VehiclesList } from '@/components/vehicles/VehiclesList';

/* * */

export function VehiclesSection() {
	//

	//
	// A. Render components

	return (
		<Section href="/vehicles" withGap>
			<VehiclesList />
		</Section>
	);

	//
}
