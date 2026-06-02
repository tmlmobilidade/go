'use client';

import { NoDataLabel } from '@/components/layout/NoDataLabel';
import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { PathWaypoint } from '@/components/lines/detail/PathWaypoint';
import { getModuleConfig } from '@tmlmobilidade/consts';
import { HubPatternRealtime } from '@tmlmobilidade/types';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

interface NextArrival {
	type: 'realtime' | 'scheduled'
	unixTs: number
}

export function LinesDetailPathList() {
	//

	//
	// A. Setup variables

	const linesDetailContext = useLinesDetailContext();

	//
	// B. Fetch data

	const { data: patternRealtimeData } = useSWR<HubPatternRealtime[]>(linesDetailContext.data.active_pattern?.id && `${getModuleConfig('hub', 'api_url')}/v1/network/arrivals/by_pattern/${linesDetailContext.data.active_pattern.id}`, { refreshInterval: 10000 });

	//
	// C. Transform data

	const preparedRealtimeData = useMemo<Map<string, NextArrival[]> | undefined>(() => {
		// Return early if there is no patternRealtimeData
		if (!patternRealtimeData) return;
		// Filter arrrivals for the current pattern
		const arrivalsForCurrentPattern = patternRealtimeData?.filter(arrivalData => arrivalData.pattern_id === linesDetailContext.data.active_pattern?.id) || [];
		// Organize arrivals by Stop ID
		const result = new Map<string, NextArrival[]>();
		arrivalsForCurrentPattern.forEach((arrivalData) => {
			// Setup the object key
			const objectKey = `${arrivalData.stop_id}-${arrivalData.stop_sequence}`;
			// Initialize the array if it doesn't exist
			if (!result.get(objectKey)) result.set(objectKey, []);
			// Push the arrival data
			if (arrivalData.estimated_arrival_unix) {
				result
					.get(objectKey)
					?.push({ type: 'realtime', unixTs: arrivalData.estimated_arrival_unix * 1000 });
			} else {
				result
					.get(objectKey)
					?.push({ type: 'scheduled', unixTs: arrivalData.scheduled_arrival_unix * 1000 });
			}
		});
		for (const key of result.keys()) {
			result.get(key)?.sort((a, b) => a.unixTs - b.unixTs);
		}
		return result;
	}, [patternRealtimeData, linesDetailContext.data.active_pattern?.id]);

	const sortedStops = useMemo(() => {
		return linesDetailContext.data.active_pattern?.path
			? [...linesDetailContext.data.active_pattern.path].sort((a, b) => a.stop_sequence - b.stop_sequence)
			: undefined;
	}, [linesDetailContext.data.active_pattern?.path]);

	//
	// D. Render components

	if (!sortedStops?.length || !linesDetailContext.data.active_pattern) {
		return <NoDataLabel />;
	}

	return (
		<div className={styles.container}>
			{sortedStops.map((waypoint, index) => (
				<PathWaypoint
					key={`${waypoint.stop_id}-${waypoint.stop_sequence}`}
					arrivals={preparedRealtimeData?.get(`${waypoint.stop_id}-${waypoint.stop_sequence}`) || []}
					id={`waypoint-${waypoint.stop_id}-${waypoint.stop_sequence}`}
					isFirstStop={index === 0}
					isLastStop={index === sortedStops.length - 1}
					isSelected={linesDetailContext.data.active_waypoint?.stop_id === waypoint.stop_id && linesDetailContext.data.active_waypoint?.stop_sequence === waypoint.stop_sequence}
					waypointData={waypoint}
				/>
			))}
		</div>
	);

	//
}
