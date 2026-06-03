'use client';

/* * */

import { NoDataLabel } from '@/components/layout/NoDataLabel';
import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { StopsDetailContentTimetableClock } from '@/components/stops/detail/StopsDetailContentTimetableClock';
import { StopsDetailContentTimetableRow } from '@/components/stops/detail/StopsDetailContentTimetableRow';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function StopsDetailContentTimetableRealtime() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const stopsDetailContext = useStopsDetailContext();

	const [showPastTrips, setShowPastTrips] = useState(false);

	//
	// B. Transform data

	const mostRecentPastTrip = stopsDetailContext.data.timetable_realtime_past?.[stopsDetailContext.data.timetable_realtime_past?.length - 1] ?? null;

	//
	// C. Handle actions

	const handleToggleShowPastTrips = () => {
		setShowPastTrips(prev => !prev);
	};

	//
	// C. Render components

	if ((!stopsDetailContext.data.timetable_realtime_past || stopsDetailContext.data.timetable_realtime_past?.length === 0) && (!stopsDetailContext.data.timetable_realtime_future || stopsDetailContext.data.timetable_realtime_future?.length === 0)) {
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

			{/* {showPastTrips && stopsDetailContext.data.timetable_realtime_past?.length && stopsDetailContext.data.timetable_realtime_past.map(tripData => (
				<div key={`${tripData.trip_id}-${tripData.stop_sequence}`}>
					<StopsDetailContentTimetableRow
						arrivalData={tripData}
						status="passed"
					/>
				</div>
			))} */}

			<StopsDetailContentTimetableClock />

			{/* {stopsDetailContext.data.timetable_realtime_future && stopsDetailContext.data.timetable_realtime_future.length > 0 && (
				<>
					{stopsDetailContext.data.timetable_realtime_future.map(tripData => (
						<StopsDetailContentTimetableRow
							key={`${tripData.trip_id}-${tripData.stop_sequence}`}
							arrivalData={tripData}
							status={tripData.estimated_arrival_unix ? 'realtime' : 'scheduled'}
						/>
					))}
					<NoDataLabel text={t('end_of_day')} withMinHeight />
				</>
			)} */}

		</>
	);

	//
}
