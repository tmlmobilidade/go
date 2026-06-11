'use client';

import { NoDataLabel } from '@/components/common/display/NoDataLabel';
import { useOperationalDate } from '@/components/common/operational-date/use-operational-date';
import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { PathWaypoint } from '@/components/lines/detail/PathWaypoint';
import { useStopsContext } from '@/components/stops/Stops.context';
import { useTripUpdatesContext } from '@/components/trip-updates/trip-updates.context';
import { Dates } from '@tmlmobilidade/dates';
import { type HubGtfsRtFeedEntity, type HubGtfsRtTripUpdate } from '@tmlmobilidade/types';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

interface NextArrival {
	type: 'realtime' | 'scheduled'
	unixTs: number
}

function getTripUpdateFromEntity(entity: HubGtfsRtFeedEntity): HubGtfsRtTripUpdate | undefined {
	if (entity.trip_update?.stop_time_update?.length) return entity.trip_update;
	if (entity.stop_time_update?.length) {
		return {
			stop_time_update: entity.stop_time_update,
			timestamp: entity.timestamp,
			trip: entity.trip,
			vehicle: entity.vehicle,
		};
	}
	return entity.trip_update ?? undefined;
}

export function LinesDetailPathList() {
	//

	//
	// A. Setup variables

	const linesDetailContext = useLinesDetailContext();
	const operationalDate = useOperationalDate();
	const stopsContext = useStopsContext();
	const tripUpdatesContext = useTripUpdatesContext();

	//
	// B. Transform data

	const realtimeArrivalsByStop = useMemo<Map<string, NextArrival[]>>(() => {
		const result = new Map<string, NextArrival[]>();
		const activePattern = linesDetailContext.data.active_pattern;
		if (!activePattern || !operationalDate.isTodaySelected) return result;
		if (!tripUpdatesContext.data.trip_update_raw?.length) return result;

		const stopSequenceToStopId = new Map<number, string>();
		const stopSequenceToAllowedStopIds = new Map<number, Set<string>>();
		const validStopKeys = new Set(activePattern.path.map((waypoint) => {
			stopSequenceToStopId.set(waypoint.stop_sequence, waypoint.stop_id);
			const allowedStopIds = new Set([waypoint.stop_id, ...(stopsContext.actions.getLegacyStopIds(waypoint.stop_id) ?? [])]);
			stopSequenceToAllowedStopIds.set(waypoint.stop_sequence, allowedStopIds);
			return `${waypoint.stop_id}-${waypoint.stop_sequence}`;
		}));
		const validTripIds = new Set<string>();
		activePattern.trips.forEach((trip) => {
			trip.trip_ids.forEach((tripId) => {
				validTripIds.add(tripId);
			});
		});

		for (const entity of tripUpdatesContext.data.trip_update_raw) {
			const tripUpdate = getTripUpdateFromEntity(entity);
			const tripId = tripUpdate?.trip?.trip_id;
			if (!tripId || !tripUpdate?.stop_time_update?.length) continue;
			if (!validTripIds.has(tripId)) continue;

			for (const stopUpdate of tripUpdate.stop_time_update) {
				const stopSequence = stopUpdate.stop_sequence;
				if (stopSequence == null) continue;
				const stopId = String(stopUpdate.stop_id);
				const allowedStopIds = stopSequenceToAllowedStopIds.get(stopSequence);
				if (!allowedStopIds?.has(stopId)) continue;
				const canonicalStopId = stopSequenceToStopId.get(stopSequence);
				if (!canonicalStopId) continue;
				const stopKey = `${canonicalStopId}-${stopSequence}`;
				if (!validStopKeys.has(stopKey)) continue;
				const arrivalTime = stopUpdate.arrival?.time;
				if (arrivalTime == null) continue;
				if (!result.get(stopKey)) result.set(stopKey, []);
				result.get(stopKey)?.push({ type: 'realtime', unixTs: arrivalTime * 1000 });
			}
		}

		for (const key of result.keys()) {
			result.get(key)?.sort((a, b) => a.unixTs - b.unixTs);
		}

		return result;
	}, [linesDetailContext.data.active_pattern, operationalDate.isTodaySelected, stopsContext.actions, tripUpdatesContext.data.trip_update_raw]);

	const scheduledArrivalsByStop = useMemo<Map<string, NextArrival[]>>(() => {
		const result = new Map<string, NextArrival[]>();
		const activePattern = linesDetailContext.data.active_pattern;
		const selectedDate = operationalDate.selectedOperationalDate;
		if (!activePattern || !selectedDate) return result;

		for (const trip of activePattern.trips) {
			if (!trip.valid_on.includes(selectedDate)) continue;
			for (const stopTime of trip.schedule) {
				const stopKey = `${stopTime.stop_id}-${stopTime.stop_sequence}`;
				const [hours, minutes, seconds = 0] = stopTime.arrival_time_24h.split(':').map(Number);
				const unixTs = Dates.now('Europe/Lisbon').set({ hour: hours, millisecond: 0, minute: minutes, second: seconds }).unix_timestamp;
				if (!result.get(stopKey)) result.set(stopKey, []);
				result.get(stopKey)?.push({ type: 'scheduled', unixTs });
			}
		}

		for (const key of result.keys()) {
			result.get(key)?.sort((a, b) => a.unixTs - b.unixTs);
		}

		return result;
	}, [linesDetailContext.data.active_pattern, operationalDate.selectedOperationalDate]);

	const preparedArrivalsByStop = useMemo<Map<string, NextArrival[]>>(() => {
		const result = new Map<string, NextArrival[]>();
		const activePattern = linesDetailContext.data.active_pattern;
		if (!activePattern) return result;

		for (const waypoint of activePattern.path) {
			const stopKey = `${waypoint.stop_id}-${waypoint.stop_sequence}`;
			const realtimeArrivals = operationalDate.isTodaySelected
				? (realtimeArrivalsByStop.get(stopKey) || [])
				: [];
			if (realtimeArrivals.length > 0) {
				result.set(stopKey, realtimeArrivals.slice(0, 3));
				continue;
			}
			result.set(stopKey, scheduledArrivalsByStop.get(stopKey) || []);
		}

		return result;
	}, [linesDetailContext.data.active_pattern, operationalDate.isTodaySelected, realtimeArrivalsByStop, scheduledArrivalsByStop]);

	const sortedStops = useMemo(() => {
		return linesDetailContext.data.active_pattern?.path
			? [...linesDetailContext.data.active_pattern.path].sort((a, b) => a.stop_sequence - b.stop_sequence)
			: undefined;
	}, [linesDetailContext.data.active_pattern?.path]);

	//
	// C. Render components

	if (!sortedStops?.length || !linesDetailContext.data.active_pattern) {
		return <NoDataLabel />;
	}

	return (
		<div className={styles.container}>
			{sortedStops.map((waypoint, index) => (
				<PathWaypoint
					key={`${waypoint.stop_id}-${waypoint.stop_sequence}`}
					arrivals={preparedArrivalsByStop.get(`${waypoint.stop_id}-${waypoint.stop_sequence}`) || []}
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
