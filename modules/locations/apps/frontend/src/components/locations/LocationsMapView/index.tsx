'use client';

/* * */

import { MapView } from '@/components/map';
import MapViewGeoJson from '@/components/map/MapViewGeoJson';
import { useLocationsContext } from '@/contexts/Locations.context';
import { Section } from '@tmlmobilidade/ui';

/* * */

export function LocationsMapView() {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();

	//
	// B. Render components

	return (
		<Section>
			<div style={{ height: 700, width: '100%' }}>
				<MapView debug>
					{/* Districts */}
					{locationsContext.data.location?.district && !locationsContext.data.filterOut.includes('district') && (
						<MapViewGeoJson
							color="green"
							data={locationsContext.data.location.district['geojson']}
							id="district"
						/>
					)}
					{/* Municipalities */}
					{locationsContext.data.location?.municipality && !locationsContext.data.filterOut.includes('municipality') && (
						<MapViewGeoJson
							color="blue"
							data={locationsContext.data.location.municipality['geojson']}
							id="municipality"
						/>
					)}
					{/* Parish */}
					{locationsContext.data.location?.parish && !locationsContext.data.filterOut.includes('parish') && (
						<MapViewGeoJson
							color="red"
							data={locationsContext.data.location.parish['geojson']}
							id="parish"
						/>
					)}
					{/* Localities */}
					{locationsContext.data.location?.locality && !locationsContext.data.filterOut.includes('locality') && (
						<MapViewGeoJson
							color="yellow"
							data={locationsContext.data.location.locality['geojson']}
							id="locality"
						/>
					)}
				</MapView>
			</div>
		</Section>
	);

	//
}
