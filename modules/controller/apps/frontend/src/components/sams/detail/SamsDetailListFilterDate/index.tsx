'use client';

/* * */

import { useSamsDetailContext } from '@/contexts/SamsDetail.context';
import { FilterTypeDateRange } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SamsDetailListFilterDate() {
	//

	// A. Setup variables

	const { t } = useTranslation();
	const samDetailContext = useSamsDetailContext();
	const { analysisFilterEndTime, analysisFilterStartTime } = samDetailContext.ui;
	const hasCompleteRange = analysisFilterStartTime != null && analysisFilterEndTime != null;
	const isActiveFromCalendar = samDetailContext.ui.selectedDayKey != null;
	const active = isActiveFromCalendar || hasCompleteRange || analysisFilterStartTime != null || analysisFilterEndTime != null;

	//
	// B. Render components

	return (
		<FilterTypeDateRange
			active={active}
			endDate={analysisFilterEndTime}
			label={t('default:sams.detail.SamsDetailList.SamsDetailListFilterDate.label')}
			onEndDateChange={samDetailContext.actions.setAnalysisFilterEnd}
			onStartDateChange={samDetailContext.actions.setAnalysisFilterStart}
			startDate={analysisFilterStartTime}
			clearable
		/>
	);
}
