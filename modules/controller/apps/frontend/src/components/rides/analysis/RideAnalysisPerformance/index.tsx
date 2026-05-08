'use client';

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
		<Collapsible description={t('default:rides.analysis.RideAnalysisPerformance.description')} title={t('default:rides.analysis.RideAnalysisPerformance.title')}>
			<Section>
				<Label size="lg" caps>{t('default:rides.analysis.RideAnalysisPerformance.no_data')}</Label>
			</Section>
		</Collapsible>
	);

	//
}
