'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Translations } from '@/lib/translations';
import { operationalStatusSchema } from '@tmlmobilidade/types';
import { Collapsible, Combobox, Grid, Section, Spacer, TextInput } from '@tmlmobilidade/ui';

/* * */

export function Shelter() {
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
			description="Informações relacionadas com o abrigo."
			title="Abrigo"
		>
			<Section>
				<Grid columns="abc" gap="md">
					<Combobox
						data={operationalStatusItems}
						label="Existe Abrigo?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('shelter_status')}
					/>
					<TextInput
						disabled={!operationalStatusItems}
						label="Código do Abrigo"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('shelter_code')}
					/>
					<TextInput
						disabled={!operationalStatusItems}
						label="Entidade Gestora do Abrigo"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('shelter_maintainer')}
					/>
				</Grid>
				<Spacer />
			</Section>
			<Section>
				<Grid columns="ab" gap="md">
					<TextInput
						disabled={!operationalStatusItems}
						label="Última verificação do estado do abrigo"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('last_schedules_check')}
					/>
					<TextInput
						disabled={!operationalStatusItems}
						label="Data de Instalação do abrigo"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('last_shelter_installation')}
					/>
				</Grid>
			</Section>

		</Collapsible>
	);

	//
}
