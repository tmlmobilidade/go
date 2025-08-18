'use client';

/* * */

import { getBaseGeoJsonFeatureCollection } from '@/utils/map.utils';
import { Layer, Source } from '@vis.gl/react-maplibre';

/* * */

export const MapViewGeofencesPrimaryLayerId = 'default-layer-geofences-border';
export const MapViewGeofencesInteractiveLayerId = 'default-layer-geofences-fill';

/* * */

interface Props {
	geofencesData?: GeoJSON.FeatureCollection
	presentBeforeId?: string
	viewId: string
}

/* * */

export function MapViewGeofences({ geofencesData = getBaseGeoJsonFeatureCollection(), presentBeforeId, viewId }: Props) {
	return (
		<>

			<Source data={geofencesData} generateId={true} id={`${viewId}-default-source-geofences-polygons`} type="geojson">
				<Layer
					beforeId={presentBeforeId}
					id={`${viewId}-default-layer-geofences-border`}
					source={`${viewId}-default-source-geofences-polygons`}
					type="line"
					layout={{
						'line-cap': 'round',
						'line-join': 'round',
					}}
					paint={{
						'line-color': ['get', 'color'],
						'line-width': ['interpolate', ['linear'], ['zoom'], 10, 4, 20, 12],
					}}
				/>
				<Layer
					beforeId={`${viewId}-default-layer-geofences-border`}
					id={`${viewId}-default-layer-geofences-fill`}
					source={`${viewId}-default-source-geofences-polygons`}
					type="fill"
					paint={{
						'fill-color': '#8CCFFF',
						'fill-opacity': 0.5,
					}}
				/>
			</Source>

		</>
	);
}
