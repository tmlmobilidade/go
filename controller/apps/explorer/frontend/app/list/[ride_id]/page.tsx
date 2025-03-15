'use client';

/* * */

import { MapView } from '@/components/map/MapView';
import { MapViewStylePath } from '@/components/map/MapViewStylePath';
import { useRidesDetailContext } from '@/contexts/RidesDetail.context';
import { centerMap } from '@/utils/map.utils';
import { getStandardWindowInterval } from '@tmlmobilidade/sae-controller-pckg-utils';
import { useMap } from '@vis.gl/react-maplibre';
import { useEffect, useMemo, useState } from 'react';

import styles from './page.module.css';

/* * */

export default function Page() {
	//

	//
	// A. Setup variables

	const ridesDetailContext = useRidesDetailContext();
	const { ridesDetailMap } = useMap();

	const [centerMapAutomatically, setCenterMapAutomatically] = useState(true);

	//
	// B. Handle actions

	useEffect(() => {
		if (!centerMapAutomatically) return;
		centerMap(
			ridesDetailMap,
			[
				...ridesDetailContext.geojson.observed_events?.features ?? [],
				...ridesDetailContext.geojson.observed_shape?.features ?? [],
				...ridesDetailContext.geojson.scheduled_path?.features ?? [],
				...ridesDetailContext.geojson.scheduled_shape?.features ?? [],
			],
			{ padding: 60 },
		);
	}, [ridesDetailContext.geojson, centerMapAutomatically]);

	const stdWindow = useMemo(() => {
		if (!ridesDetailContext.data.ride?.start_time_scheduled) return { end: null, start: null };
		return getStandardWindowInterval(ridesDetailContext.data.ride?.start_time_scheduled);
	}, [ridesDetailContext.data.ride]);

	//
	// C. Render components

	return (
		<div style={{ height: '75vh', width: '100vw' }}>
			<div className={styles.details}>
				{/* <pre>Ride ID: {ridesDetailContext.data.ride_id}</pre> */}
				<pre>{JSON.stringify(ridesDetailContext.data.ride, null, 2)}</pre>
				<pre>Std Window: Start {stdWindow.start} | End {stdWindow.end}</pre>
				<pre>Trip ID: {ridesDetailContext.data.ride?.trip_id}</pre>
				<pre>VE: {ridesDetailContext.data.vehicle_events.length || -1}</pre>
			</div>
			<MapView id="ridesDetailMap" onDragEnd={() => setCenterMapAutomatically(false)}>
				<MapViewStylePath shapeData={ridesDetailContext.geojson.scheduled_shape} viewId="scheduled" waypointsData={ridesDetailContext.geojson.scheduled_path} />
				<MapViewStylePath shapeData={ridesDetailContext.geojson.observed_shape} viewId="observed" waypointsData={ridesDetailContext.geojson.observed_events} />
			</MapView>
		</div>
	);

	//
}
