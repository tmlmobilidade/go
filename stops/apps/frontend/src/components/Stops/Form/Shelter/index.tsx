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
						disabled={has_shelter.some(item => item.value === 'yes')}
						label="Código do Abrigo"
						miw="100%"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('shelter_code')}
					/>
					<TextInput
						disabled={has_shelter.some(item => item.value === 'yes')}
						label="Entidade Gestora do Abrigo"
						miw="100%"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('shelter_maintainer')}
					/>
				</Grid>
				<Spacer />
			</Section>
			<Section>
				<TextInput
					disabled={has_shelter.some(item => item.value === 'yes')}
					label="Data de Instalação do abrigo"
					miw="100%"
					placeholder="2023-02-10"
					{...stopDetailContext.data.form.getInputProps('last_shelter_installation')}
				/>
			</Section>

		</Collapsible>
	);

	//
}
