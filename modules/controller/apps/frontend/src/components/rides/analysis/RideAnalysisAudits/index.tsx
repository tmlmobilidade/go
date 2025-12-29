'use client';

/* * */

import { Collapsible, Label, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RideAnalysisAudits() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('controller', { keyPrefix: 'rides.analysis.audits' });

	//
	// B. Render components

	return (
		<Collapsible description={t('description')} title={t('title')}>
			<Section>
				<Label size="lg" caps>{t('no_data')}</Label>
			</Section>
		</Collapsible>
	);

	//
}
