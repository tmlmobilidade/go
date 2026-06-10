/* * */

import { NoDataLabel } from '@/components/common/display/NoDataLabel';
import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { StopsDetailTimetableRow } from '@/components/stops/detail/StopsDetailTimetableRow';
import { StopsDetailViewTimetableSkeleton } from '@/components/stops/detail/StopsDetailViewTimetableSkeleton';
import { useTranslation } from 'react-i18next';

/* * */

export function StopsDetailViewTimetable() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const stopsDetailContext = useStopsDetailContext();

	//
	// B. Render components

	if (stopsDetailContext.flags.is_loading) {
		return <StopsDetailViewTimetableSkeleton />;
	}

	if (!stopsDetailContext.data.timetable?.length) {
		return <NoDataLabel text={t('default:stops.StopsDetailContentTimetableSchedule.no_service')} withMinHeight />;
	}

	return (
		<>
			{stopsDetailContext.data.timetable.map(item => (
				<StopsDetailTimetableRow key={item._id} data={item} />
			))}
			<NoDataLabel text={t('default:stops.StopsDetailContentTimetableSchedule.end_of_day')} withMinHeight />
		</>
	);

	//
}
