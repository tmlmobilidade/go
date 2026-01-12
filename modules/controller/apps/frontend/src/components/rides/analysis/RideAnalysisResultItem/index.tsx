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
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Surface height="full">
			<Section gap="xs" height="100%" justifyContent="space-between" padding="sm">
				<div>
					{id && <Label size="sm">{id}</Label>}
					<div>
						{rideAnalysisLabels[id]?.title && <Label>{t(`controller:rides.analysis.Result.labels.${id}.title`)}</Label>}
						{rideAnalysisLabels[id]?.description && <Text size="sm">{t(`controller:rides.analysis.Result.labels.${id}.description`)}</Text>}
					</div>
				</div>
				{grade === 'error' && <Tag label={t('controller:rides.analysis.ResultItem.statuses.failed')} variant="danger" filled />}
				{grade === 'fail' && <Tag label={t('controller:rides.analysis.ResultItem.statuses.fail')} variant="danger" />}
				{grade === 'pass' && <Tag label={t('controller:rides.analysis.ResultItem.statuses.pass')} variant="success" />}
			</Section>
		</Surface>
	);

	//
}
