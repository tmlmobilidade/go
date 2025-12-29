'use client';

/* * */

import { Collapsible, Label, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RideAnalysisPerformance() {
	//

	//
	// A.Setup Variables

	const { t } = useTranslation('controller', { keyPrefix: 'rides.analysis.performance' });

	//
	// B. Render Components

	return (
		<Collapsible description={t('description')} title={t('title')}>
			<Section>
				<Label size="lg" caps>{t('noData')}</Label>
			</Section>
		</Collapsible>
	);

	//
}
