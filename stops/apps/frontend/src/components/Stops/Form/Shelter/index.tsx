'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Translations } from '@/lib/translations';
import { hasAnySchema } from '@tmlmobilidade/types';
import { Collapsible, Combobox, Grid, Section, Spacer, TextInput } from '@tmlmobilidade/ui';

/* * */

export function Shelter() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	const has_shelter = hasAnySchema.options.map (value => ({
		label: Translations.HAS_ANY[value],
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
						data={has_shelter}
						label="Existe Abrigo?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('has_shelter')}
					/>
					<TextInput
						disabled={!has_shelter.some(item => item.value === 'YES')}
						label="Código do Abrigo"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('shelter_code')}
					/>
					<TextInput
						disabled={!has_shelter.some(item => item.value === 'YES')}
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
						disabled={!has_shelter.some(item => item.value === 'YES')}
						label="Última verificação do estado do abrigo"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('last_schedules_check')}
					/>
					<TextInput
						disabled={!has_shelter.some(item => item.value === 'YES')}
						label="Data de Instalação do abrigo"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('last_shelter_installation')}
					/>
				</Grid>
			</Section>

		</Collapsible>
	);

	//
}
