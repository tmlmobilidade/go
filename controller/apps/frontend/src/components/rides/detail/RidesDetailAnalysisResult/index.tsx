'use client';

/* * */

import { RidesDetailAnalysisResultItem } from '@/components/rides/detail/RidesDetailAnalysisResultItem';
import { RideAnalysis } from '@tmlmobilidade/types';
import { Collapsible, Grid, Label, Section } from '@tmlmobilidade/ui';

/* * */

export function RidesDetailAnalysisResult({ items }: { items: (RideAnalysis & { id: string })[] }) {
	//

	//
	// A. Render components

	return (
		<Collapsible description="Eventos dos veículos mapeados" title="Resultado das Análises">
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
