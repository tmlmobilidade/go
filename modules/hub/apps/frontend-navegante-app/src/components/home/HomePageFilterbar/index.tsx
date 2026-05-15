'use client';

import { HomePageFilterbarTransports } from '@/components/home/HomePageFilterbarTransports';
import { Section } from '@/components/layout/Section';
import { Surface } from '@/components/layout/Surface';

/* * */

export function HomePageFilterbar() {
	//

	//
	// A. Render Components

	return (
		<Surface>
			<Section>
				<HomePageFilterbarTransports />
			</Section>
		</Surface>
	);

	//
}
