'use client';

/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { StopsTable } from '@/components/patterns/table/StopsTable';
import { Collapsible, Section, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PatternDetailSectionZones() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const patternDetailContext = usePatternDetailContext();

	//
	// B. Render components

	return (
		<Collapsible title={t('patterns:detail.PatternDetailSectionZones.zones')}>
			<Section>
				{patternDetailContext.data.path?.length ? (
					<StopsTable />
				) : (
					<Text c="var(--color-system-text-200)" size="sm">
						{t('patterns:detail.PatternDetailSectionZones.zones_empty')}
					</Text>
				)}
			</Section>
		</Collapsible>
	);

	//
}
