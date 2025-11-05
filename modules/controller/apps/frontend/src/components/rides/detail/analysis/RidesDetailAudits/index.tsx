'use client';

/* * */

import { Collapsible, Label, Section } from '@tmlmobilidade/ui';

/* * */

export function RidesDetailAudits() {
	return (
		<Collapsible description="Observações em terreno" title="Auditoria">
			<Section>
				<Label size="lg" caps>Sem Dados</Label>
			</Section>
		</Collapsible>
	);
}
