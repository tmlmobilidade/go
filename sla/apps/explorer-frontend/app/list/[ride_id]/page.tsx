'use client';

/* * */

import { MapView } from '@/components/map/MapView';
import { MapViewStyleStops } from '@/components/map/MapViewStyleStops';
import { MapViewStyleVehicles } from '@/components/map/MapViewStyleVehicles';
import { useRidesDetailContext } from '@/contexts/RidesDetail.context';
import { DateTime } from 'luxon';
import { useMemo } from 'react';

/* * */

export default function Page() {
	//

	const ridesDetailContext = useRidesDetailContext();

	const vehicleEventsGeojson: GeoJSON.FeatureCollection = useMemo(() => {
		return {
			features: ridesDetailContext.data.vehicle_events
				.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
				.map((vehicleEvent) => {
					return {
						geometry: {
							coordinates: [vehicleEvent.longitude, vehicleEvent.latitude],
							type: 'Point',
						},
						properties: {
							timestamp: DateTime.fromJSDate(new Date(vehicleEvent.created_at)).toISO(),
							trip_id: vehicleEvent.trip_id,
						},
						type: 'Feature',
					};
				}),
			type: 'FeatureCollection',
		};
	}, [ridesDetailContext.data.vehicle_events]);

	return (
		<div style={{ height: '75vh', width: '100vw' }}>
			VE: {ridesDetailContext.data.vehicle_events.length || -1}
			<MapView>
				<MapViewStyleStops stopsData={vehicleEventsGeojson} />
			</MapView>
		</div>
	);

	//
}
