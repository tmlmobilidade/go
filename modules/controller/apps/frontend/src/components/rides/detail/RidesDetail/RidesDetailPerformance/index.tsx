'use client';

/* * */

import { Collapsible, Label, Section } from '@tmlmobilidade/ui';

/* * */

export function RidesDetailPerformance() {
	return (
		<Collapsible description="Dados de desempenho da circulação" title="Performance">
			<Section>
				<Label size="lg" caps>Sem Dados</Label>
			</Section>
		</Collapsible>
	);
}
