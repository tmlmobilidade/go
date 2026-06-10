'use client';

import { NoDataLabel } from '@/components/common/display/NoDataLabel';
import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { StopsDetailViewTimetableRow } from '@/components/stops/detail/StopsDetailViewTimetableRow';
import { Dates } from '@tmlmobilidade/dates';
import { Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function StopsDetailViewTimetable() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const stopsDetailContext = useStopsDetailContext();

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

	//
	// C. Render components

	if (!stopsDetailContext.data.timetable?.length) {
		return <NoDataLabel text={t('default:stops.StopsDetailContentTimetableSchedule.no_service')} withMinHeight />;
	}

	return (
		<Section padding="none">
			{stopsDetailContext.data.timetable.map(item => (
				<StopsDetailViewTimetableRow
					key={item._id}
					data={item}
					withClock={item._id === timetableClockIdInsert}
				/>
			))}
			<NoDataLabel text={t('default:stops.StopsDetailContentTimetableSchedule.end_of_day')} withMinHeight />
		</Section>
	);
}
