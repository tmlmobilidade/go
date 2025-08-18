'use client';

/* * */

import { type RideAnalysis } from '@tmlmobilidade/types';
import { Label, Section, Surface, Tag, Text } from '@tmlmobilidade/ui';

import { rideAnalysisLabels } from './labels';

/* * */

interface Props {
	grade: RideAnalysis['grade']
	id: string
}

/* * */

export function RidesDetailAnalysisResultItem({ grade, id }: Props) {
	return (
		<Surface>
			<Section gap="xs" padding="sm">
				{id && <Label size="sm">{id}</Label>}
				<div>
					{rideAnalysisLabels[id]?.title && <Label>{rideAnalysisLabels[id].title}</Label>}
					{rideAnalysisLabels[id]?.description && <Text size="sm">{rideAnalysisLabels[id].description}</Text>}
				</div>
				{grade === 'error' && <Tag label="Erro" variant="danger" filled />}
				{grade === 'fail' && <Tag label="Fail" variant="danger" />}
				{grade === 'pass' && <Tag label="Pass" variant="success" />}
			</Section>
		</Surface>
	);
}
