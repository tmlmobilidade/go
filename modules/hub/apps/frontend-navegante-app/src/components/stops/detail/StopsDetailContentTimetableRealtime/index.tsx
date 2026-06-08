'use client';

/* * */

import { NoDataLabel } from '@/components/common/display/NoDataLabel';
import { getFutureRowStatus, isRealtimeArrival, normalizeTripIdForMatch, type StopTimetableRealtimeArrival } from '@/components/stops/detail/parse-eta-gtfs';
import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { StopsDetailContentTimetableClock } from '@/components/stops/detail/StopsDetailContentTimetableClock';
import { StopsDetailContentTimetableRow } from '@/components/stops/detail/StopsDetailContentTimetableRow';
import { type HubArrival } from '@tmlmobilidade/types';
import { DateTime } from 'luxon';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

/**
 * When GTFS has no rows for this stop, split static schedule into past and future trips.
 *
 * Called from: StopsDetailContentTimetableRealtime useMemo
 */
function splitScheduleByNow(schedule: HubArrival[] | undefined): {
	futureTrips: HubArrival[]
	pastTrips: HubArrival[]
} {
	const pastTrips: HubArrival[] = [];
	const futureTrips: HubArrival[] = [];

	if (!schedule?.length) {
		return { futureTrips, pastTrips };
	}

	// 1. Compare each scheduled arrival to the current time
	const nowInUnixSeconds = DateTime.now().toSeconds();

	for (const trip of schedule) {
		const [hours, minutes, seconds = 0] = trip.arrival_time_24h.split(':').map(Number);
		const arrivalUnix = DateTime.local().set({ hour: hours, millisecond: 0, minute: minutes, second: seconds }).toUnixInteger();

		// 2. Sort into past or future lists
		if (arrivalUnix < nowInUnixSeconds) {
			pastTrips.push(trip);
		} else {
			futureTrips.push(trip);
		}
	}

	return { futureTrips, pastTrips };
}

/**
 * Overlay GTFS rows onto schedule trips matched by trip_id + stop_sequence.
 *
 * Called from: StopsDetailContentTimetableRealtime useMemo
 */
function mergeScheduleWithGtfs(
	schedulePast: HubArrival[],
	scheduleFuture: HubArrival[],
	gtfsArrivals: StopTimetableRealtimeArrival[],
): {
	futureTrips: Array<HubArrival | StopTimetableRealtimeArrival>
	pastTrips: Array<HubArrival | StopTimetableRealtimeArrival>
} {
	const nowInUnixSeconds = DateTime.now().toSeconds();
	const gtfsByTrip = new Map<string, StopTimetableRealtimeArrival>();

	for (const arrival of gtfsArrivals) {
		const keys = [
			`${arrival.trip_id}-${arrival.stop_sequence}`,
			`${normalizeTripIdForMatch(arrival.trip_id)}-${arrival.stop_sequence}`,
		];
		for (const key of keys) {
			gtfsByTrip.set(key, arrival);
		}
	}

	const findGtfs = (trip: HubArrival, requireFutureEta: boolean) => {
		const keys = [
			`${trip.trip_id}-${trip.stop_sequence}`,
			`${normalizeTripIdForMatch(trip.trip_id)}-${trip.stop_sequence}`,
		];
		for (const key of keys) {
			const gtfsArrival = gtfsByTrip.get(key);
			if (!gtfsArrival) continue;
			if (requireFutureEta && (gtfsArrival.estimated_arrival_unix ?? 0) < nowInUnixSeconds) continue;
			return gtfsArrival;
		}
		return undefined;
	};

	return {
		futureTrips: scheduleFuture.map(trip => findGtfs(trip, true) ?? trip),
		pastTrips: schedulePast.map(trip => findGtfs(trip, false) ?? trip),
	};
}

/* * */

export function StopsDetailContentTimetableRealtime() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const stopsDetailContext = useStopsDetailContext();

	const [showPastTrips, setShowPastTrips] = useState(false);

	//
	// B. Transform data — use GTFS past/future, or fall back to schedule

	const { futureTrips, pastTrips } = useMemo(() => {
		const scheduleSplit = splitScheduleByNow(stopsDetailContext.data.timetable_schedule);

		return mergeScheduleWithGtfs(
			scheduleSplit.pastTrips,
			scheduleSplit.futureTrips,
			stopsDetailContext.data['timetable_realtime'] ?? [],
		);
	}, [
		stopsDetailContext.data['timetable_realtime'],
		stopsDetailContext.data.timetable_schedule,
	]);

	const mostRecentPastTrip = pastTrips[pastTrips.length - 1] ?? null;

	//
	// C. Handle actions

	const handleToggleShowPastTrips = () => {
		setShowPastTrips(prev => !prev);
	};

	//
	// D. Render components

	if (pastTrips.length === 0 && futureTrips.length === 0) {
		return (
			<NoDataLabel text={t('default:stops.StopsDetailContentTimetableRealtime.no_service')} withMinHeight />
		);
	}

	return (
		<>

			<p className={styles.showPastTripsToggle} onClick={handleToggleShowPastTrips}>
				{showPastTrips ? t('default:stops.StopsDetailContentTimetableRealtime.show_past_trips_toggle.hide') : t('default:stops.StopsDetailContentTimetableRealtime.show_past_trips_toggle.show')}
			</p>

			{!showPastTrips && mostRecentPastTrip && (
				<div>
					<StopsDetailContentTimetableRow
						arrivalData={mostRecentPastTrip}
						status="passed"
					/>
				</div>
			)}

			{showPastTrips && pastTrips.length > 0 && pastTrips.map(tripData => (
				<div key={`${tripData.trip_id}-${tripData.stop_sequence}-${isRealtimeArrival(tripData) ? 'rt' : (tripData as HubArrival).arrival_time}`}>
					<StopsDetailContentTimetableRow
						arrivalData={tripData}
						status="passed"
					/>
				</div>
			))}

			<StopsDetailContentTimetableClock />

			{futureTrips.length > 0 && (
				<>
					{futureTrips.map(tripData => (
						<StopsDetailContentTimetableRow
							key={`${tripData.trip_id}-${tripData.stop_sequence}-${isRealtimeArrival(tripData) ? 'rt' : (tripData as HubArrival).arrival_time}`}
							arrivalData={tripData}
							status={getFutureRowStatus(tripData)}
						/>
					))}
					<NoDataLabel text={t('default:stops.StopsDetailContentTimetableRealtime.end_of_day')} withMinHeight />
				</>
			)}

		</>
	);

	//
}
