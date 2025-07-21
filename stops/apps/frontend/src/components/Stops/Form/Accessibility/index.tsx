'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Translations } from '@/lib/translations';
import { operationalStatusSchema } from '@tmlmobilidade/types';
import { Collapsible, Combobox, Grid, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function Accessibility() {
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
			description="Informações sobre a acessiilidade da paragem e sua envolvente."
			title="Acessibilidade"
		>
			<Section>
				<Grid columns="abc" gap="md">
					<Combobox
						data={operationalStatusItems}
						label="Tem Passeio?"
						placeholder="Escolha uma opção"
						fullWidth
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Combobox
						data={operationalStatusItems}
						label="Tipo de Passeio?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('')}
					/>
				</Grid>
			</Section>

			<Section>
				<Grid columns="abcd" gap="sm">
					<Combobox
						data={operationalStatusItems}
						label="Tem Passadeira?"
						placeholder="Escolha uma opção"
						fullWidth
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Combobox
						data={operationalStatusItems}
						label="Tem Acesso Rebaixado/Contínuo?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Combobox
						data={operationalStatusItems}
						label="Tem Acesso Largo"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Combobox
						data={operationalStatusItems}
						label="Tem Pavimento Tátil?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('')}
					/>
				</Grid>
			</Section>
			<Section>
				<Grid columns="ab" gap="md">
					<Combobox
						data={operationalStatusItems}
						label="Tem Estacionamento Abusivo?"
						placeholder="Escolha uma opção"
						fullWidth
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Combobox
						data={operationalStatusItems}
						label="Permite Embarque de PMR?"
						placeholder="Escolha uma opção"
						fullWidth
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<TextInput
						label="Última Manutenção da Acessibilidade?"
						miw="100%"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<TextInput
						label="Última Verificação da Acessibilidade?"
						miw="100%"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
				</Grid>
			</Section>

		</Collapsible>
	);

	//
}
