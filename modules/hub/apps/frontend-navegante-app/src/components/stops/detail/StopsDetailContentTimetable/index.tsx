/* * */

import { useOperationalDate } from '@/components/common/operational-date/use-operational-date';
import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { StopsDetailContentTimetableRealtime } from '@/components/stops/detail/StopsDetailContentTimetableRealtime';
import { StopsDetailContentTimetableSchedule } from '@/components/stops/detail/StopsDetailContentTimetableSchedule';
import { StopsDetailContentTimetableSkeleton } from '@/components/stops/detail/StopsDetailContentTimetableSkeleton';

import styles from './styles.module.css';

/* * */

export function StopsDetailContentTimetable() {
	//

	//
	// A. Setup variables

	const operationalDate = useOperationalDate();
	const stopsDetailContext = useStopsDetailContext();

	//
	// B. Render components

	if (stopsDetailContext.flags.is_loading_timetable) {
		return (
			<StopsDetailContentTimetableSkeleton />
		);
	}

	return (
		<div className={styles.container}>
			{operationalDate.isTodaySelected
				//
				? <StopsDetailContentTimetableRealtime />
				: <StopsDetailContentTimetableSchedule />}
		</div>
	);

	//
}
