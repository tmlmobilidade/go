'use client';

// import { HomePageFilterbarAgencies } from '@/components/home/HomePageFilterbarAgencies';
import { HomePageFilterbarTransports } from '@/components/home/HomePageFilterbarTransports';
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
					<HomePageFilterbarTransports />
					{/* <HomePageFilterbarAgencies /> */}
				</Grid>
			</Section>
		</Surface>
	);

	//
}
