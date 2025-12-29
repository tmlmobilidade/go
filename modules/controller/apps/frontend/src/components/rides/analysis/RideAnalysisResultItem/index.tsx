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

	const { t } = useTranslation('controller', { keyPrefix: 'rides.analysis.result.labels' });
	const { t: tStatuses } = useTranslation('global', { keyPrefix: 'statuses' });

	//
	// B. Render components
	return (
		<Surface height="full">
			<Section gap="xs" height="100%" justifyContent="space-between" padding="sm">
				<div>
					{id && <Label size="sm">{id}</Label>}
					<div>
						{rideAnalysisLabels[id]?.title && <Label>{t(rideAnalysisLabels[id].title)}</Label>}
						{rideAnalysisLabels[id]?.description && <Text size="sm">{t(rideAnalysisLabels[id].description)}</Text>}
					</div>
				</div>
				{grade === 'error' && <Tag label={tStatuses('failed')} variant="danger" filled />}
				{grade === 'fail' && <Tag label={tStatuses('fail')} variant="danger" />}
				{grade === 'pass' && <Tag label={tStatuses('pass')} variant="success" />}
			</Section>
		</Surface>
	);
}
