'use client';

import { useStopDetailContext } from '@/contexts/StopDetail.context';
import { Collapsible, Combobox, DateTimePicker, Grid, Section, TextInput } from '@tmlmobilidade/ui';
import { getUnixTimestampFromJSDate } from '@tmlmobilidade/utils';

/* * */

export default function StopShelter() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

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
						{...stopDetailContext.data.form.getInputProps('shelter_status')}
					/>

					<TextInput
						label="Código do Abrigo"
						maxLength={255}
						placeholder="SH1234"
						{...stopDetailContext.data.form.getInputProps('shelter_code')}
					/>

					<TextInput
						label="Entidade Gestora do Abrigo"
						maxLength={255}
						placeholder="JC Decaux"
						{...stopDetailContext.data.form.getInputProps('shelter_maintainer')}
					/>
				</Grid>

				<Grid columns="ab" gap="md">
					<TextInput
						label="Modelo do Abrigo"
						maxLength={255}
						{...stopDetailContext.data.form.getInputProps('shelter_model')}
					/>

					<TextInput
						label="Fabricante do Abrigo"
						maxLength={255}
						{...stopDetailContext.data.form.getInputProps('shelter_make')}
					/>
				</Grid>

				<Grid gap="md">
					<DateTimePicker
						label="Data de Instalação do Abrigo"
						placeholder="2024-09"
						{...stopDetailContext.data.form.getInputProps('last_shelter_installation')}
						value={new Date(stopDetailContext.data.form.getValues().last_shelter_installation)}
						onChange={(date) => {
							stopDetailContext.data.form.setFieldValue('last_shelter_installation', getUnixTimestampFromJSDate(date));
						}}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
