/* * */

import { useSamsDetailContext } from '@/contexts/SamsDetail.context';
import { AnalysisCalender, Collapsible, Section, SegmentedControl } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function SamsDetailCalender() {
	//

	// A. Setup variables

	const { t } = useTranslation();
	const samDetailContext = useSamsDetailContext();
	const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'month'>('day');

	//
	// B. Handle actions

	const handleChangeView = (value: string) => {
		if (value !== 'day' && value !== 'month') return;
		setSelectedPeriod(value);
	};

	//
	// C. Render component

	return (
		<Collapsible
			description={t('default:sams.detail.SamsDetailCalender.description')}
			title={t('default:sams.detail.SamsDetailCalender.title')}
		>
			<Section gap="md">
				<SegmentedControl
					data={[
						{ label: t('default:sams.detail.SamsDetailCalender.day.label'), value: 'day' },
						{ label: t('default:sams.detail.SamsDetailCalender.month.label'), value: 'month' },
					]}
					onChange={handleChangeView}
					value={selectedPeriod}
				/>
				<AnalysisCalender analyses={samDetailContext.data.sam?.analysis ?? []} groupBy={selectedPeriod} />
			</Section>
		</Collapsible>
	);
}
