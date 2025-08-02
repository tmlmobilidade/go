'use client';

/* * */

import { Collapsible, Label, Section } from '@tmlmobilidade/ui';

/* * */

export function RidesDetailJustifications() {
	return (
		<Collapsible description="O que o operador entendeu sobre esta circulação" title="Justifcações do Operador">
			<Section>
				<Label size="lg" caps>Sem Dados</Label>
			</Section>
		</Collapsible>
	);
}
