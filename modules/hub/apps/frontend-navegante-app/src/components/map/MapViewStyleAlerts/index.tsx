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
						'ACCIDENT', 'icon-car-crash',
						'TECHNICAL_PROBLEM', 'icon-car-crash',
						'VEHICLE_ISSUE', 'icon-car-crash',
						'TRAFFIC_JAM', 'icon-car-crash',
						'CONSTRUCTION', 'icon-barrier-block',
						'ROAD_INCIDENT', 'icon-barrier-block',
						'ROAD_ISSUE', 'icon-barrier-block',
						'DEMONSTRATION', 'icon-speakerphone',
						'STRIKE', 'icon-speakerphone',
						'HOLIDAY', 'icon-calendar-event',
						'NETWORK_UPDATE', 'icon-calendar-event',
						'MAINTENANCE', 'icon-tool',
						'SYSTEM_FAILURE', 'icon-tool',
						'MEDICAL_EMERGENCY', 'icon-ambulance',
						'POLICE_ACTIVITY', 'icon-ambulance',
						'WEATHER', 'icon-cloud-storm',
						'icon-info-triangle',
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
