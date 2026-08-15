'use client';

import { type RideAnalysesRegistry } from '@tmlmobilidade/go-types-operation';
import { GradeStatusDisplay, Label, Section, Surface, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface RideAnalysisAnalysesItemProps {
	id: keyof RideAnalysesRegistry
	item: RideAnalysesRegistry[keyof RideAnalysesRegistry]
}

/* * */

export function RideAnalysisAnalysesItem({ id, item }: RideAnalysisAnalysesItemProps) {
	//

	const { t } = useTranslation();

	return (
		<Surface height="full">
			<Section gap="xs" height="100%" justifyContent="space-between" padding="sm">
				<div>
					<Label size="sm">{id}</Label>
					<Label>{t(`ride_analysis:${id}.label`)}</Label>
					<Text size="sm">{t(`ride_analysis:${id}.description`)}</Text>
				</div>
				<GradeStatusDisplay value={item.grade_status} />
			</Section>
		</Surface>
	);
}
