'use client';

/* * */

import { Collapsible, Label, Section } from '@tmlmobilidade/ui';

/* * */

export function RidesDetailMetadata() {
	return (
		<Collapsible description="Informações gerais sobre esta circulação" title="Metadados">
			<Section>
				<Label size="lg" caps>Sem Dados</Label>
			</Section>
		</Collapsible>
	);
}
