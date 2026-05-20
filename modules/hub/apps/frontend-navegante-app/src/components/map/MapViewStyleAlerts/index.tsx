'use client';

import { getBaseGeoJsonFeatureCollection } from '@/utils/map.utils';
import { Layer, Source } from '@vis.gl/react-maplibre';

/* * */

export const MapViewStyleAlertsLayerId = 'default-layer-alerts-all';
export const MapViewStyleAlertsSourceId = 'default-source-alerts-all';
export const MapViewStyleAlertsFallbackLayerId = 'default-layer-alerts-fallback';

/* * */

interface Props {
	data?: GeoJSON.FeatureCollection
	presentBeforeId?: string
}

/* * */

const baseGeoJsonFeatureCollection = getBaseGeoJsonFeatureCollection();

/* * */

export function MapViewStyleAlerts({ data = baseGeoJsonFeatureCollection, presentBeforeId }: Props) {
	return (
		<Source data={data} generateId={true} id={MapViewStyleAlertsSourceId} type="geojson">
			<Layer
				beforeId={presentBeforeId}
				id={MapViewStyleAlertsFallbackLayerId}
				source={MapViewStyleAlertsSourceId}
				type="circle"
				paint={{
					'circle-color': [
						'match',
						['get', 'cause'],
						'CONSTRUCTION', '#ef4444',
						'DEMONSTRATION', '#f97316',
						'WEATHER', '#0ea5e9',
						'NETWORK_UPDATE', '#a855f7',
						'#2563eb',
					],
					'circle-opacity': 0.55,
					'circle-radius': [
						'interpolate',
						['linear'],
						['zoom'],
						8, 3,
						14, 6,
					],
					'circle-stroke-color': '#ffffff',
					'circle-stroke-width': 1,
				}}
			/>
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
						'CONSTRUCTION', 'icon-barrier-block',
						'ROAD_ISSUE', 'icon-barrier-block',
						'DEMONSTRATION', 'icon-speakerphone',
						'STRIKE', 'icon-speakerphone',
						'HOLIDAY', 'icon-calendar-event',
						'NETWORK_UPDATE', 'icon-calendar-event',
						'MAINTENANCE', 'icon-tool',
						'MEDICAL_EMERGENCY', 'icon-ambulance',
						'POLICE_ACTIVITY', 'icon-ambulance',
						'WEATHER', 'icon-cloud-storm',
						'icon-info-triangle',
					],
					'icon-size': [
						'interpolate',
						['linear'],
						['zoom'],
						10, 0.35,
						20, 0.55,
					],
				}}
			/>
		</Source>
	);
}
