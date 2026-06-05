/* * */

import { NoDataLabel } from '@/components/common/display/NoDataLabel';
import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { StopsDetailContentTimetableRow } from '@/components/stops/detail/StopsDetailContentTimetableRow';
import { useTranslation } from 'react-i18next';

/* * */

export function StopsDetailContentTimetableSchedule() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const stopsDetailContext = useStopsDetailContext();

	//
	// B. Render components

	if (!stopsDetailContext.data.timetable_schedule || stopsDetailContext.data.timetable_schedule?.length === 0) {
		return (
			<NoDataLabel text={t('default:stops.StopsDetailContentTimetableSchedule.no_service')} withMinHeight />
		);
	}

	return (
		<>
			{stopsDetailContext.data.timetable_schedule.map(item => (
				<StopsDetailContentTimetableRow
					key={`${item.pattern_id}-${item.trip_id}-${item.stop_sequence}-${item.arrival_time}`}
					arrivalData={item}
					status="future"
				/>
			))}
			<NoDataLabel text={t('default:stops.StopsDetailContentTimetableSchedule.end_of_day')} withMinHeight />
		</>
	);

	//
}
