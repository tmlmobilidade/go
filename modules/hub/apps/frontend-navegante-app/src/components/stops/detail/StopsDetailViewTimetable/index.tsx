'use client';

import { NoDataLabel } from '@/components/common/display/NoDataLabel';
import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { StopsDetailViewTimetableRow } from '@/components/stops/detail/StopsDetailViewTimetableRow';
import { Dates } from '@tmlmobilidade/dates';
import { Section } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function StopsDetailViewTimetable() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const stopsDetailContext = useStopsDetailContext();

	const [showPastArrivals, setShowPastArrivals] = useState(false);

	//
	// B. Transform data

	const timetableClockIdInsert = useMemo(() => {
		// Skip if no timetable data
		if (!stopsDetailContext.data.timetable?.length) return;
		// Get now in Unix timestamp
		const now = Dates.now('Europe/Lisbon').unix_timestamp;
		// Check if the timetable starts after now or ends before now
		if (stopsDetailContext.data.timetable[0].arrival_scheduled_ms > now) return;
		if (stopsDetailContext.data.timetable[stopsDetailContext.data.timetable.length - 1].arrival_scheduled_ms < now) return;
		// Find the index of the first item in the timetable that has a scheduled arrival time greater than now
		const firstItemAfterNow = stopsDetailContext.data.timetable.find(item => item.arrival_effective_ms > now);
		return firstItemAfterNow?._id;
	}, [stopsDetailContext.data.timetable]);

	const pastArrivals = useMemo(() => {
		// Skip if no timetable data
		if (!stopsDetailContext.data.timetable) return [];
		// Filter all past arrivals
		const pastArrivals = stopsDetailContext.data.timetable.filter(item => item.is_past);
		// If no past arrivals, return an empty array
		if (!pastArrivals.length) return [];
		// If show past arrivals is true, return all past arrivals
		if (showPastArrivals) return pastArrivals;
		// Otherwise, return the most recent past arrival
		return [pastArrivals[pastArrivals.length - 1]];
	}, [showPastArrivals, stopsDetailContext.data.timetable]);

	const futureArrivals = useMemo(() => {
		// Skip if no timetable data
		if (!stopsDetailContext.data.timetable) return [];
		// Filter all future arrivals
		return stopsDetailContext.data.timetable.filter(item => !item.is_past);
	}, [stopsDetailContext.data.timetable]);

	//
	// C. Render components

	const toggleShowPastArrivals = () => {
		setShowPastArrivals(prev => !prev);
	};

	//
	// C. Render components

	if (!stopsDetailContext.data.timetable?.length) {
		return <NoDataLabel text={t('default:stops.StopsDetailContentTimetableSchedule.no_service')} withMinHeight />;
	}

	return (
		<Section padding="none">

			<p className={styles.toggleShowPastArrivals} onClick={toggleShowPastArrivals}>
				{showPastArrivals ? t('default:stops.StopsDetailContentTimetableRealtime.show_past_trips_toggle.hide') : t('default:stops.StopsDetailContentTimetableRealtime.show_past_trips_toggle.show')}
			</p>

			<div className={styles.arrivalsWrapper}>
				{pastArrivals.map(item => (
					<StopsDetailViewTimetableRow
						key={item._id}
						data={item}
						withClock={item._id === timetableClockIdInsert}
					/>
				))}
			</div>

			<div className={styles.arrivalsWrapper}>
				{futureArrivals.map(item => (
					<StopsDetailViewTimetableRow
						key={item._id}
						data={item}
						withClock={item._id === timetableClockIdInsert}
					/>
				))}
			</div>

			<NoDataLabel text={t('default:stops.StopsDetailContentTimetableSchedule.end_of_day')} withMinHeight />
		</Section>
	);
}
