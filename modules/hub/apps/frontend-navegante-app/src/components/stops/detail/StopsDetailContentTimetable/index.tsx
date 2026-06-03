/* * */

import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { StopsDetailContentTimetableRealtime } from '@/components/stops/detail/StopsDetailContentTimetableRealtime';
import { StopsDetailContentTimetableSchedule } from '@/components/stops/detail/StopsDetailContentTimetableSchedule';
import { StopsDetailContentTimetableSkeleton } from '@/components/stops/detail/StopsDetailContentTimetableSkeleton';
import { useOperationalDateContext } from '@/contexts/OperationalDate.context';

import styles from './styles.module.css';

/* * */

export function StopsDetailContentTimetable() {
	//

	//
	// A. Setup variables

	const operationalDateContext = useOperationalDateContext();
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
			{operationalDateContext.flags.is_today_selected
				? <StopsDetailContentTimetableRealtime />
				: <StopsDetailContentTimetableSchedule />}
		</div>
	);

	//
}
