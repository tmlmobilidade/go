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
						'ACCIDENT', 'alert-icon-accident',
						'TECHNICAL_PROBLEM', 'alert-icon-tool',
						'VEHICLE_ISSUE', 'alert-icon-tool',
						'TRAFFIC_JAM', 'alert-icon-accident',
						'CONSTRUCTION', 'alert-icon-barrier',
						'ROAD_INCIDENT', 'alert-icon-barrier',
						'ROAD_ISSUE', 'alert-icon-barrier',
						'DEMONSTRATION', 'alert-icon-megaphone',
						'STRIKE', 'alert-icon-megaphone',
						'HOLIDAY', 'alert-icon-calendar',
						'NETWORK_UPDATE', 'alert-icon-calendar',
						'MAINTENANCE', 'alert-icon-tool',
						'SYSTEM_FAILURE', 'alert-icon-tool',
						'MEDICAL_EMERGENCY', 'alert-icon-emergency',
						'POLICE_ACTIVITY', 'alert-icon-emergency',
						'WEATHER', 'alert-icon-storm',
						'alert-icon-info',
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
