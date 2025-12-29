'use client';

/* * */

import { type RideAnalysis } from '@tmlmobilidade/types';
import { Label, Section, Surface, Tag, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { rideAnalysisLabels } from './labels';

/* * */

interface RideAnalysisAnalysisResultItemProps {
	grade: RideAnalysis['grade']
	id: string
}

/* * */

export function RideAnalysisAnalysisResultItem({ grade, id }: RideAnalysisAnalysisResultItemProps) {
	//

	//
	// A. Setup Variables

	const { t } = useTranslation('global', { keyPrefix: 'statuses' });

	//
	// B. Render components
	return (
		<Surface height="full">
			<Section gap="xs" height="100%" justifyContent="space-between" padding="sm">
				<div>
					{id && <Label size="sm">{id}</Label>}
					<div>
						{rideAnalysisLabels[id]?.title && <Label>{rideAnalysisLabels[id].title}</Label>}
						{rideAnalysisLabels[id]?.description && <Text size="sm">{rideAnalysisLabels[id].description}</Text>}
					</div>
				</div>
				{grade === 'error' && <Tag label={t('failed')} variant="danger" filled />}
				{grade === 'fail' && <Tag label={t('fail')} variant="danger" />}
				{grade === 'pass' && <Tag label={t('pass')} variant="success" />}
			</Section>
		</Surface>
	);
}
