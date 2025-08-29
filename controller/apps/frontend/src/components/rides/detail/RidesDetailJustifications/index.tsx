'use client';

/* * */

import { Button, Collapsible, Section, Textarea } from '@tmlmobilidade/ui';

/* * */

export function RidesDetailJustifications() {
	return (
		<Collapsible description="O que aconteceu com esta circulação." title="Justificações">
			<Section gap="lg">
				<Textarea resize="vertical" size="lg" w="100%" autosize />
				<Button label="Submeter Justificação" />
			</Section>
		</Collapsible>
	);
}
