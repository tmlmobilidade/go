/* * */

import { AnalysisCalendar } from '@/components/common/AnalysisSams/AnalysisCalendar';
import { useSamsDetailContext } from '@/contexts/SamDetail.context';
import { Collapsible, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SamsDetailCalendar() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const samDetailContext = useSamsDetailContext();

	//
	// B. Render component

	return (
		<Collapsible
			description={t('default:sams.detail.SamsDetailCalendar.description')}
			title={t('default:sams.detail.SamsDetailCalendar.title')}
		>
			<Section gap="md">
				<AnalysisCalendar
					analyses={samDetailContext.data.sam?.analysis ?? []}
					onDayClick={samDetailContext.actions.applyAnalysisFilterFromCalendarDay}
					rangeEndTs={samDetailContext.data.sam?.seen_last_at}
					rangeStartTs={samDetailContext.data.sam?.seen_first_at}
				/>
			</Section>
		</Collapsible>
	);
}
