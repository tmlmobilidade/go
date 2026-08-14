'use client';

import { RideAnalysisResultItem } from '@/components/rides/detail/analysis/RideAnalysisResultItem';
import { Collapsible, Grid, Label, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface RideAnalysisResultProps {
	defaultOpen?: boolean
	items: (any & { id: string })[]
}

/* * */

export function RideAnalysisResult() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Collapsible description={t('default:rides.analysis.RideAnalysisResult.description')} title={t('default:rides.analysis.RideAnalysisResult.title')} defaultOpen>
			<Section>
				{/* {!items.length ? (
					<Label size="lg" caps>{t('default:rides.analysis.RideAnalysisResult.no_data')}</Label>
				) : (
					<Grid columns="abc" gap="md">
						{items.map(item => (
							<RideAnalysisResultItem key={item.id} grade={item.grade} id={item.id} />
						))}
					</Grid>
				)} */}
			</Section>
		</Collapsible>
	);

	//
}
