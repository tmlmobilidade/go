'use client';

/* * */

import { RideAnalysisAnalysisResultItem } from '@/components/rides/analysis/RideAnalysisResultItem';
import { RideAnalysis } from '@tmlmobilidade/types';
import { Collapsible, Grid, Label, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface RideAnalysisAnalysisResultProps {
	defaultOpen?: boolean
	items: (RideAnalysis & { id: string })[]
}

/* * */

export function RideAnalysisAnalysisResult({ defaultOpen = false, items }: RideAnalysisAnalysisResultProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('controller');

	//
	// B. Render components

	return (
		<Collapsible defaultOpen={defaultOpen} description={t('rides.analysis.Result.description')} title={t('rides.analysis.Result.title')}>
			<Section>
				{!items.length ? (
					<Label size="lg" caps>{t('rides.analysis.Result.no_data')}</Label>
				) : (
					<Grid columns="abc" gap="md">
						{items.map(item => (
							<RideAnalysisAnalysisResultItem key={item.id} grade={item.grade} id={item.id} />
						))}
					</Grid>
				)}
			</Section>
		</Collapsible>
	);

	//
}
