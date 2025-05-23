'use client';

import { Collapsible, Combobox, DateTimePicker, Grid, Section, TextInput } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

/* * */

export function StopShelter({ data }) {
	//

	//
	// A. Setup variables

	enum ShelterStatusValues {
		is_damaged = 'Abrigo Danificado',
		is_missing = 'Abrigo em Falta',
		is_ok = 'Abrigo Operacional',
		not_applicable = 'Não Aplicável',
		unknown = 'Abrigo Desconhecido',
	}

	const shelterStatusValues = [
		'is_damaged',
		'is_missing',
		'is_ok',
		'not_applicable',
		'unknown',
	];

	//
	// A. Transform data

	const shelterStatusItems = shelterStatusValues.map(el => ({
		label: ShelterStatusValues[el],
		value: el,
	}));

	//
	// B. Render components

	return (
		<Collapsible
			description="Informações relacionadas com o abrigo."
			title="Abrigo"
		>
			<Section gap="md">
				<Grid columns="abc" gap="md">
					<Combobox
						data={shelterStatusItems}
						label="Existe Abrigo?"
						{...data.form.getInputProps('shelter_status')}
					/>

					<TextInput
						label="Código do Abrigo"
						maxLength={255}
						placeholder="SH1234"
						{...data.form.getInputProps('shelter_code')}
					/>

					<TextInput
						label="Entidade Gestora do Abrigo"
						maxLength={255}
						placeholder="JC Decaux"
						{...data.form.getInputProps('shelter_maintainer')}
					/>
				</Grid>

				<Grid columns="ab" gap="md">
					<TextInput
						label="Modelo do Abrigo"
						maxLength={255}
						{...data.form.getInputProps('shelter_model')}
					/>

					<TextInput
						label="Fabricante do Abrigo"
						maxLength={255}
						{...data.form.getInputProps('shelter_make')}
					/>
				</Grid>

				<Grid gap="md">
					<DateTimePicker
						label="Data de Instalação do Abrigo"
						placeholder="2024-09"
						{...data.form.getInputProps('last_shelter_installation')}
						value={new Date(data.form.getValues().last_shelter_installation)}
						onChange={(date) => {
							data.form.setFieldValue('last_shelter_installation', Dates.fromJSDate(date).unix_timestamp);
						}}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
