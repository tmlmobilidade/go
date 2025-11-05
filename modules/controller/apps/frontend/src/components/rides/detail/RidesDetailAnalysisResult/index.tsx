'use client';

/* * */

import { RidesDetailAnalysisResultItem } from '@/components/rides/detail/RidesDetailAnalysisResultItem';
import { RideAnalysis } from '@tmlmobilidade/go-types';
import { Collapsible, Grid, Label, Section } from '@tmlmobilidade/ui';

/* * */

interface Props {
	defaultOpen?: boolean
	items: (RideAnalysis & { id: string })[]
}

export function RidesDetailAnalysisResult({ defaultOpen = false, items }: Props) {
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
							<RidesDetailAnalysisResultItem key={item.id} grade={item.grade} id={item.id} />
						))}
					</Grid>
				)}
			</Section>
		</Collapsible>
	);

	//
}
