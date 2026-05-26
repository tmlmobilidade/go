'use client';

import { Section } from '@/components/layout/Section';
import { StopsList } from '@/components/stops/StopsList';

/* * */

export function StopsSection() {
	//

	//
	// A. Render components

	return (
		<Section href="/stops" withGap>
			<StopsList />
		</Section>
	);

	//
}
