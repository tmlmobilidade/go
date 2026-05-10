'use client';

import { RideAnalysisAnalysisResultItem } from '@/components/rides/analysis/RideAnalysisResultItem';
import { type Ride, type RideAnalysis } from '@tmlmobilidade/types';
import { Collapsible, Grid, Label, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface RideAnalysisAnalysisResultProps {
	defaultOpen?: boolean
	items: (RideAnalysis & { id: keyof Ride['analysis'] })[]
}

/* * */

export function RideAnalysisAnalysisResult({ defaultOpen = false, items }: RideAnalysisAnalysisResultProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Collapsible defaultOpen={defaultOpen} description={t('default:rides.analysis.RideAnalysisResult.description')} title={t('default:rides.analysis.RideAnalysisResult.title')}>
			<Section>
				{!items.length ? (
					<Label size="lg" caps>{t('default:rides.analysis.RideAnalysisResult.no_data')}</Label>
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
