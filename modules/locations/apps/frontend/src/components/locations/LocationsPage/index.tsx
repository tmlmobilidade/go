'use client';

import { LocationsCoordinateInput } from '@/components/locations/LocationsCoordinateInput';
import { LocationsFilters } from '@/components/locations/LocationsFilters';
import { LocationsMapView } from '@/components/locations/LocationsMapView';
import { LocationsSearch } from '@/components/locations/LocationsSearch';
import { Grid, Pane, Section } from '@tmlmobilidade/ui';
import { MapProvider } from '@vis.gl/react-maplibre';

/* * */

export function LocationsPage() {
	//

	//
	// B. Render components

	return (
		<MapProvider>
			<Section>
				<Grid columns="aab" gap="md">
					<Pane>
						<LocationsMapView />
					</Pane>
					<Pane>
						<LocationsCoordinateInput />
						<LocationsSearch />
						<LocationsFilters />
					</Pane>
				</Grid>
			</Section>
		</MapProvider>
	);

	//
}
