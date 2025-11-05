'use client';

/* * */

import { type RideAnalysis } from '@go/types';
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
		<Surface height="full">
			<Section gap="xs" height="100%" justifyContent="space-between" padding="sm">
				<div>
					{id && <Label size="sm">{id}</Label>}
					<div>
						{rideAnalysisLabels[id]?.title && <Label>{rideAnalysisLabels[id].title}</Label>}
						{rideAnalysisLabels[id]?.description && <Text size="sm">{rideAnalysisLabels[id].description}</Text>}
					</div>
				</div>
				{grade === 'error' && <Tag label="Erro" variant="danger" filled />}
				{grade === 'fail' && <Tag label="Fail" variant="danger" />}
				{grade === 'pass' && <Tag label="Pass" variant="success" />}
			</Section>
		</Surface>
	);
}
