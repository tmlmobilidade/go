'use client';

import { Collapsible, NoDataLabel, Section } from '@tmlmobilidade/ui';
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
				<NoDataLabel />
			</Section>
		</Collapsible>
	);

	//
}
