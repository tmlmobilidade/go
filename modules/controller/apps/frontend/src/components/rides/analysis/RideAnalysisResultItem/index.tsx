'use client';

/* * */

import { type RideAnalysis } from '@tmlmobilidade/types';
import { Label, Section, Surface, Tag, Text } from '@tmlmobilidade/ui';

import { rideAnalysisLabels } from './labels';

/* * */

interface RideAnalysisAnalysisResultItemProps {
	grade: RideAnalysis['grade']
	id: string
}

/* * */

export function RideAnalysisAnalysisResultItem({ grade, id }: RideAnalysisAnalysisResultItemProps) {
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
