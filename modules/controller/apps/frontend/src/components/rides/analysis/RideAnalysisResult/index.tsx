'use client';

/* * */

import { RideAnalysisAnalysisResultItem } from '@/components/rides/analysis/RideAnalysisResultItem';
import { RideAnalysis } from '@tmlmobilidade/types';
import { Collapsible, Grid, Label, Section } from '@tmlmobilidade/ui';

/* * */

interface Props {
	defaultOpen?: boolean
	items: (RideAnalysis & { id: string })[]
}

export function RideAnalysisAnalysisResult({ defaultOpen = false, items }: Props) {
	//

	//
	// A. Render components

	return (
		<Collapsible defaultOpen={defaultOpen} description="Eventos dos veículos mapeados" title="Resultado das Análises">
			<Section>
				{!items.length ? (
					<Label size="lg" caps>Sem Dados</Label>
				) : (
					<Grid columns="abc" gap="md">
						{items.map(item => (
							<RideAnalysisAnalysisResultItem key={item.id} grade={item.grade} id={item.id} />
						))}
					</Grid>
				)}
			</Section>
		</Collapsible>
	);

	//
}
