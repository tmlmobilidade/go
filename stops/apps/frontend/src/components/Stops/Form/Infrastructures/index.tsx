'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Translations } from '@/lib/translations';
import { operationalStatusSchema } from '@tmlmobilidade/types';
import { Collapsible, Combobox, Grid, Section, Spacer, TextInput } from '@tmlmobilidade/ui';

/* * */

export function Infraestructures() {
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
			description="Informações relacionadas com os equipamentos da paragem e envolvente."
			title="Infraestrutura"
		>
			<Section>
				<Grid columns="abc" gap="md">

					<Combobox
						data={operationalStatusItems}
						label="Existe Poste?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('pole_status')}
					/>
					<Combobox
						data={operationalStatusItems}
						label="Existe Cobertura?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('')}
					/>

				</Grid>
				<Spacer />
			</Section>

			<Section>
				<Grid columns="abc" gap="md">
					<Combobox
						data={operationalStatusItems}
						label="Existe Mupi?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Combobox
						data={operationalStatusItems}
						label="Existe Banco?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Combobox
						data={operationalStatusItems}
						label="Existe Papeleira?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('')}
					/>
				</Grid>
				<Spacer />
			</Section>

			<Section>
				<Grid columns="ab" gap="md">
					<Combobox
						data={operationalStatusItems}
						label="Existe Iluminação?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Combobox
						data={operationalStatusItems}
						label="Existe Ligação Elétrica?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('')}
					/>
				</Grid>
				<Spacer />
			</Section>

			<Section>
				<Combobox
					data={operationalStatusItems}
					label="Tipo de Relação com a Via"
					placeholder="..."
					fullWidth
					{...stopDetailContext.data.form.getInputProps('')}
				/>
				<Spacer />
			</Section>

			<Section>
				<Grid columns="ab" gap="md">
					<TextInput
						label="Última Manutenção da Infraestrutura"
						miw="100%"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('last_infrastructure_maintenance')}
					/>
					<TextInput
						label="Última Verificação da Infraestrutura"
						miw="100%"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('last_infrastructure_check')}
					/>
				</Grid>
				<Spacer />
			</Section>
		</Collapsible>
	);

	//
}
