'use client';

import { Collapsible, Label, Section } from '@tmlmobilidade/ui';

/* * */

export function RideAnalysisStops() {
	return (
		<Collapsible description="Distribuição dos passageiros por paragem" title="Visão por Paragem">
			<Section>
				<Label size="lg" caps>Sem Dados</Label>
			</Section>
		</Collapsible>
	);
}
