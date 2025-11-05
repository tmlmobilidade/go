'use client';

/* * */

import { Collapsible, Label, Section } from '@go/ui';

/* * */

export function RidesDetailSupport() {
	return (
		<Collapsible description="Observações e informações adicionais" title="Apoio ao Passageiro">
			<Section>
				<Label size="lg" caps>Sem Dados</Label>
			</Section>
		</Collapsible>
	);
}
