'use client';

import { type RideAnalysesRegistry } from '@tmlmobilidade/go-types-operation';
import { type GradeStatus } from '@tmlmobilidade/go-types-shared';
import { GradeStatusDisplay, Label, Section, Surface, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface RideAnalysisAnalysesItemProps {
	grade: GradeStatus
	id: keyof RideAnalysesRegistry
}

/* * */

export function RideAnalysisAnalysesItem({ grade, id }: RideAnalysisAnalysesItemProps) {
	//

	const { t } = useTranslation();

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
				<GradeStatusDisplay value={grade} />
			</Section>
		</Surface>
	);
}
