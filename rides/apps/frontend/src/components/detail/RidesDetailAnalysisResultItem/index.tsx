'use client';

/* * */

import { type RideAnalysis } from '@tmlmobilidade/types';
import { Label, Section, Surface, Tag, Text } from '@tmlmobilidade/ui';

/* * */

interface Props {
	_id: string
	description?: string
	grade: RideAnalysis['grade']
	title?: string
}

/* * */

export function RidesDetailAnalysisResultItem({ _id, description, grade, title }: Props) {
	return (
		<Surface>
			<Section gap="xs" padding="sm">
				{_id && <Label size="sm">{_id}</Label>}
				<div>
					<Label>{title}</Label>
					{description && <Text size="sm">{description}</Text>}
				</div>
				{grade === 'error' && <Tag label="Erro" variant="danger" filled />}
				{grade === 'fail' && <Tag label="Fail" variant="danger" />}
				{grade === 'pass' && <Tag label="Pass" variant="success" />}
			</Section>
		</Surface>
	);
}
