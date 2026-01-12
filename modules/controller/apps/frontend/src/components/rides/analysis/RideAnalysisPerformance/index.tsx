'use client';

/* * */

import { Collapsible, Label, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RideAnalysisPerformance() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Collapsible description={t('controller:rides.analysis.Performance.description')} title={t('controller:rides.analysis.Performance.title')}>
			<Section>
				<Label size="lg" caps>{t('controller:rides.analysis.Performance.no_data')}</Label>
			</Section>
		</Collapsible>
	);

	//
}
