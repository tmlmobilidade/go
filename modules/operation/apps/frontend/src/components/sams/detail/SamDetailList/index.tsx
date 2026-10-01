'use client';

/* * */

import { useSamsDetailContext } from '@/contexts/SamDetail.context';
import { Collapsible } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

import { SamsDetailListFilters } from '@/components/sams/detail/SamDetailListFilters';
import { SamsDetailListItems } from '@/components/sams/detail/SamDetailListItems';

/* * */

export function SamsDetailList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const samDetailContext = useSamsDetailContext();

	//
	// B. Transform data

	const { analysisApexVersionFilter, analysisFilterEndTime, analysisFilterStartTime, selectedDayKey } = samDetailContext.ui;
	const hasCompleteRange = analysisFilterStartTime != null && analysisFilterEndTime != null;
	const analysisRecords = samDetailContext.data.sam?.analysis ?? [];
	const uniqueApexCount = new Set(analysisRecords.map(a => (a.apex_version?.trim() ?? ''))).size;
	const apexFilterActive = uniqueApexCount > 0 && analysisApexVersionFilter.length > 0 && analysisApexVersionFilter.length < uniqueApexCount;
	const hasActiveFilter = selectedDayKey != null || hasCompleteRange || apexFilterActive;

	//
	// C. Render components

	return (
		<Collapsible
			key={`sams-detail-list-${samDetailContext.ui.listOpenVersion}`}
			defaultOpen={hasActiveFilter}
			description={t('default:sams.detail.SamsDetailList.description')}
			title={t('default:sams.detail.SamsDetailList.title')}
		>
			<SamsDetailListFilters />
			<SamsDetailListItems />
		</Collapsible>
	);
}
