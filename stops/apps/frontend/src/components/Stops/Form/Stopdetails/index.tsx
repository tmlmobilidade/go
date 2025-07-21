'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Translations } from '@/lib/translations';
import { operationalStatusSchema } from '@tmlmobilidade/types';
import { Collapsible, Combobox, Grid, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function StopDetails() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	const operationalStatusItems = operationalStatusSchema.options.map (value => ({
		label: Translations.OPERATIONAL_STATUS[value],
		value: value,
	}));

	//
	// B. Render components

	return (
		<Collapsible
			description="Informações gerais sobre esta paragem."
			title="Detalhes desta Paragem"
		>
			<Section>
				<Grid columns="abc" gap="sm">
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

				</Grid>
			</Section>
			<Section gap="md">
				<TextInput
					label="Antigo Nome da Paragem (p/ alterar)"
					miw="100%"
					placeholder="..."
					{...stopDetailContext.data.form.getInputProps('name')}
				/>
				<TextInput
					label="Nome da Paragem (depois da correção)"
					miw="100%"
					placeholder="..."
					{...stopDetailContext.data.form.getInputProps('new_name')}
				/>
			</Section>
			<Section gap="md">
				<Grid columns="ab" gap="sm">
					<TextInput
						label="Nome Curto (Postalete)"
						miw="100%"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('short_name')}
					/>
					<TextInput
						label="Nome Falado (Text-to-Speech)"
						miw="100%"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('tts_name')}
					/>
				</Grid>
			</Section>
			<Section gap="md">
				<Combobox
					data={operationalStatusItems}
					label="Estado Operacional"
					placeholder="Escolha uma opção"
					fullWidth
					{...stopDetailContext.data.form.getInputProps('operational_status')}
				/>
			</Section>

		</Collapsible>
	);

	//
}
