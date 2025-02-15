'use client';

/* * */

import { MapView } from '@/components/map/MapView';
import { MapViewStylePath } from '@/components/map/MapViewStylePath';
import { useRidesDetailContext } from '@/contexts/RidesDetail.context';

/* * */

export default function Page() {
	//

	//
	// A. Setup variables

	const ridesDetailContext = useRidesDetailContext();

	//
	// B. Transform data
	//
	// C. Render components

	return (
		<div style={{ height: '75vh', width: '100vw' }}>
			<MapView id="rides-detail-map">
				<MapViewStylePath shapeData={ridesDetailContext.geojson.scheduled_shape} viewId="scheduled" waypointsData={ridesDetailContext.geojson.scheduled_path} />
				<MapViewStylePath shapeData={ridesDetailContext.geojson.observed_shape} viewId="observed" waypointsData={ridesDetailContext.geojson.observed_events} />
			</MapView>
			VE: {ridesDetailContext.data.vehicle_events.length || -1}
		</div>
	);

	//
}
