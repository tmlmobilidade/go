'use client';

/* * */

import { Collapsible, Label, Section } from '@go/ui';

/* * */

export function RidesDetailStops() {
	return (
		<Collapsible description="Distribuição dos passageiros por paragem" title="Visão por Paragem">
			<Section>
				<Label size="lg" caps>Sem Dados</Label>
			</Section>
		</Collapsible>
	);
}
