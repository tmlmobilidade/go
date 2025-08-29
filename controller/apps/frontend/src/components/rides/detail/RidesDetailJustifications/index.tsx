'use client';

/* * */

import { Button, Collapsible, Section, Textarea, TextInput } from '@tmlmobilidade/ui';

/* * */

export function RidesDetailJustifications() {
	return (
		<Collapsible description="O que aconteceu com esta circulação." title="Justificações">
			<Section gap="lg">
				<Textarea label="Mensagem" minRows={5} resize="vertical" size="lg" w="100%" autosize />
				<TextInput label="Trip ID manual (override)" size="lg" w="100%" />
				<Button label="Submeter Justificação" />
			</Section>
		</Collapsible>
	);
}
