'use client';

/* * */

import { Collapsible, Label, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RideAnalysisAudits() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('controller');

	//
	// B. Render components

	return (
		<Collapsible description={t('rides.analysis.Audits.description')} title={t('rides.analysis.Audits.title')}>
			<Section>
				<Label size="lg" caps>{t('rides.analysis.Audits.no_data')}</Label>
			</Section>
		</Collapsible>
	);

	//
}
