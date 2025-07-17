'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Collapsible, Pane, Section, Spacer, Textarea, TextInput } from '@tmlmobilidade/ui';

/* * */

export function StopDetails() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Render components

	return (
		<Pane>
			<Collapsible
				description="Detalhes desta Paragem"
				title="Informações gerais sobre esta paragem."
			>
				<Section gap="sm">
					<TextInput
						label="Código Único da Paragem"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('_id')}
					/>
					<TextInput
						label="Latitude"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('latitude')}
					/>
					<TextInput
						label="Longitude"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('longitude')}
					/>

				</Section>
				<Section gap="md">
					<Spacer />
					<Textarea
						label="Antifo Nome da Paragem (p/ alterar)"
						miw={800}
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('name')}
					/>
					<Textarea
						label="Nome da Paragem (depois da correção)"
						miw={800}
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('new_name')}
					/>
				</Section>
			</Collapsible>
		</Pane>
	);

	//
}
