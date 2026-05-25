'use client';

import { FilterByTransports } from '@/components/home/FilterByTransports';
import { Grid } from '@/components/layout/Grid';
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
				<Grid columns="ab">
					<FilterByTransports />
				</Grid>
			</Section>
		</Surface>
	);

	//
}
