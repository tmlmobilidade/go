'use client';

import { type Ride, type RideAnalysis } from '@tmlmobilidade/types';
import { Label, Section, Surface, Tag, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface RideAnalysisAnalysisResultItemProps {
	grade: RideAnalysis['grade']
	id: keyof Ride['analysis']
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
					<Label size="sm">{id}</Label>
					<div>
						<Label>{t(`ride_analysis:${id}.label`)}</Label>
						<Text size="sm">{t(`ride_analysis:${id}.description`)}</Text>
					</div>
				</div>
				{grade === 'error' && <Tag label={t('default:rides.analysis.RideAnalysisResultItem.statuses.failed')} variant="danger" filled />}
				{grade === 'fail' && <Tag label={t('default:rides.analysis.RideAnalysisResultItem.statuses.fail')} variant="danger" />}
				{grade === 'pass' && <Tag label={t('default:rides.analysis.RideAnalysisResultItem.statuses.pass')} variant="success" />}
			</Section>
		</Surface>
	);

	//
}
