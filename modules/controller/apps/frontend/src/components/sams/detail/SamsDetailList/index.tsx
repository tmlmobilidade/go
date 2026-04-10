'use client';

/* * */

import { useSamsDetailContext } from '@/contexts/SamsDetail.context';
import { Collapsible } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

import { SamsDetailListFilters } from '../SamsDetailListFilters';
import { SamsDetaisListItems } from '../SamsDetaisListItems';

/* * */

export function SamsDetailList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const samDetailContext = useSamsDetailContext();
	const { analysisFilterEndTime, analysisFilterStartTime, selectedDayKey } = samDetailContext.ui;
	const hasCompleteRange = analysisFilterStartTime != null && analysisFilterEndTime != null;
	const hasActiveFilter = selectedDayKey != null || hasCompleteRange;

	//
	// B. Render component

	return (
		<Collapsible
			key={`sams-detail-list-${samDetailContext.ui.listOpenVersion}`}
			defaultOpen={hasActiveFilter}
			description={t('default:sams.detail.SamsDetailList.description')}
			title={t('default:sams.detail.SamsDetailList.title')}
		>
			<SamsDetailListFilters />
			<SamsDetaisListItems />
		</Collapsible>
	);
}
