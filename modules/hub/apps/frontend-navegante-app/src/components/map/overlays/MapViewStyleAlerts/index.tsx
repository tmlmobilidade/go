'use client';

import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { Layer, Source } from '@vis.gl/react-maplibre';

/* * */

export const MapViewStyleAlertsLayerId = 'default-layer-alerts-all';
export const MapViewStyleAlertsSourceId = 'default-source-alerts-all';
export const MapViewStyleAlertsInteractiveLayerId = 'default-layer-alerts-all';

/* * */

interface Props {
	data?: GeoJSON.FeatureCollection
	presentBeforeId?: string
	visible?: boolean
}

/* * */

const baseGeoJsonFeatureCollection = getBaseGeoJsonFeatureCollection();

/* * */

export function MapViewStyleAlerts({ data = baseGeoJsonFeatureCollection, presentBeforeId, visible = true }: Props) {
	return (
		<Source data={data} generateId={true} id={MapViewStyleAlertsSourceId} type="geojson">
			<Layer
				beforeId={presentBeforeId}
				id={MapViewStyleAlertsLayerId}
				source={MapViewStyleAlertsSourceId}
				type="symbol"
				layout={{
					'icon-allow-overlap': true,
					'icon-anchor': 'center',
					'icon-ignore-placement': true,
					'icon-image': [
						'match',
						['get', 'cause'],
						'ACCIDENT', 'map-alert-icon-accident',
						'TECHNICAL_PROBLEM', 'map-alert-icon-tool',
						'VEHICLE_ISSUE', 'map-alert-icon-tool',
						'TRAFFIC_JAM', 'map-alert-icon-accident',
						'CONSTRUCTION', 'map-alert-icon-barrier',
						'ROAD_INCIDENT', 'map-alert-icon-barrier',
						'ROAD_ISSUE', 'map-alert-icon-barrier',
						'DEMONSTRATION', 'map-alert-icon-megaphone',
						'STRIKE', 'map-alert-icon-megaphone',
						'HOLIDAY', 'map-alert-icon-calendar',
						'NETWORK_UPDATE', 'map-alert-icon-calendar',
						'MAINTENANCE', 'map-alert-icon-tool',
						'SYSTEM_FAILURE', 'map-alert-icon-tool',
						'MEDICAL_EMERGENCY', 'map-alert-icon-emergency',
						'POLICE_ACTIVITY', 'map-alert-icon-emergency',
						'WEATHER', 'map-alert-icon-storm',
						'map-alert-icon-info',
					],
					'icon-size': [
						'interpolate',
						['linear'],
						['zoom'],
						10, 0.15,
						20, 0.3,
					],
					'symbol-placement': 'point',
					'visibility': visible ? 'visible' : 'none',
				}}
			/>
		</Source>
	);
}
