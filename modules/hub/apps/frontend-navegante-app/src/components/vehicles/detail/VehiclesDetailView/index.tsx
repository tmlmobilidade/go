'use client';

import { VehiclesDetailsContent } from '@/components/vehicles/detail/VehiclesDetailsContent';
import { Section } from '@tmlmobilidade/ui';

/* * */

export function VehiclesDetailView() {
	//

	//
	// A. Render componentss

	return (
		<Section flexDirection="column" padding="none">
			<VehiclesDetailsContent />
		</Section>
	);
}
