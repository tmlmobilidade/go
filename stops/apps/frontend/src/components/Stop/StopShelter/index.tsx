'use client';

import { useStopsDetailContext } from '@/contexts/StopsDetail.context';
import { Collapsible, Combobox, DateTimePicker, Grid, Section, TextInput } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

/* * */

export function StopShelter() {
	//

	//
	// A. Setup variables
	const stopsDetailContext = useStopsDetailContext();

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
	// B. Transform data
	const shelterStatusItems = shelterStatusValues.map(el => ({
		label: ShelterStatusValues[el],
		value: el,
	}));

	//
	// C. Render components
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
						{...stopsDetailContext.data.form.getInputProps('shelter_status')}
					/>

					<TextInput
						label="Código do Abrigo"
						maxLength={255}
						placeholder="SH1234"
						{...stopsDetailContext.data.form.getInputProps('shelter_code')}
					/>

					<TextInput
						label="Entidade Gestora do Abrigo"
						maxLength={255}
						placeholder="JC Decaux"
						{...stopsDetailContext.data.form.getInputProps('shelter_maintainer')}
					/>
				</Grid>

				<Grid columns="ab" gap="md">
					<TextInput
						label="Modelo do Abrigo"
						maxLength={255}
						{...stopsDetailContext.data.form.getInputProps('shelter_model')}
					/>

					<TextInput
						label="Fabricante do Abrigo"
						maxLength={255}
						{...stopsDetailContext.data.form.getInputProps('shelter_make')}
					/>
				</Grid>

				<Grid gap="md">
					<DateTimePicker
						label="Data de Instalação do Abrigo"
						placeholder="2024-09"
						{...stopsDetailContext.data.form.getInputProps('last_shelter_installation')}
						value={new Date(stopsDetailContext.data.form.getValues().last_shelter_installation)}
						onChange={(date) => {
							const formattedDate = new Date(date);
							stopsDetailContext.data.form.setFieldValue('last_shelter_installation', Dates.fromJSDate(formattedDate).unix_timestamp);
						}}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
