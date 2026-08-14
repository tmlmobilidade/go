'use client';

import { type Ride } from '@tmlmobilidade/go-types-operation';
import { GradeStatus } from '@tmlmobilidade/go-types-shared';
import { Label, Section, Surface, Tag, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface RideAnalysisResultItemProps {
	grade: GradeStatus
	id: string
}

/* * */

export function RideAnalysisResultItem({ grade, id }: RideAnalysisResultItemProps) {
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
					{/* <Label size="sm">{id}</Label> */}
					<div>
						{/* <Label>{t(`ride_analysis:${id}.label`)}</Label> */}
						{/* <Text size="sm">{t(`ride_analysis:${id}.description`)}</Text> */}
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
