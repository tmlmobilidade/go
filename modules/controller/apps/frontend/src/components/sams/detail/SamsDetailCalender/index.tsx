/* * */

import { useSamsDetailContext } from '@/contexts/SamsDetail.context';
import { AnalysisCalender, Collapsible, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SamsDetailCalender() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const samDetailContext = useSamsDetailContext();

	//
	// B. Render component

	return (
		<Collapsible
			description={t('default:sams.detail.SamsDetailCalender.description')}
			title={t('default:sams.detail.SamsDetailCalender.title')}
		>
			<Section gap="md">
				<AnalysisCalender
					analyses={samDetailContext.data.sam?.analysis ?? []}
					onDayClick={samDetailContext.actions.applyAnalysisFilterFromCalendarDay}
					rangeEndTs={samDetailContext.data.sam?.seen_last_at}
					rangeStartTs={samDetailContext.data.sam?.seen_first_at}
				/>
			</Section>
		</Collapsible>
	);
}
