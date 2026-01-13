'use client';

/* * */

import { Collapsible, Label, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RideAnalysisAudits() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Collapsible description={t('controller:rides.analysis.RideAnalysisAudits.description')} title={t('controller:rides.analysis.RideAnalysisAudits.title')}>
			<Section>
				<Label size="lg" caps>{t('controller:rides.analysis.RideAnalysisAudits.no_data')}</Label>
			</Section>
		</Collapsible>
	);

	//
}
