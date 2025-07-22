'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Translations } from '@/lib/translations';
import { jurisdictionSchema, operationalStatusSchema } from '@tmlmobilidade/types';
import { Collapsible, Combobox, Grid, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function AdministratorInfo() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	const operationalStatusItems = operationalStatusSchema.options.map (value => ({
		label: Translations.OPERATIONAL_STATUS[value],
		value: value,
	}));

	const jurisdictionItems = jurisdictionSchema.options.map (value => ({
		label: Translations.JURISDICATION[value],
		value: value,
	}));

	//
	// B. Render components

	return (
		<Collapsible
			description="Informações sobre a localização administrativa e responsabilidade de gestão desta paragem."
			title="Informação Administrativa"
		>
			<Section>
				<Grid columns="abc" gap="sm">
					<Combobox
						data={operationalStatusItems}
						label="Município"
						placeholder="Escolha uma opção"
						fullWidth
						{...stopDetailContext.data.form.getInputProps('municipality')}
					/>
					<TextInput
						label="Freguesia"
						placeholder="Maçãs"
						{...stopDetailContext.data.form.getInputProps('parish_id')}
					/>
					<TextInput
						label="Localidade"
						{...stopDetailContext.data.form.getInputProps('locality')}
					/>
				</Grid>
			</Section>
			<Section>
				<Combobox
					data={jurisdictionItems}
					defaultValue={Translations.JURISDICATION.UNKNOWN}
					label="Jusrisdição"
					placeholder="CM Moita"
					fullWidth
					{...stopDetailContext.data.form.getInputProps('jurisdiction')}
				/>
			</Section>

		</Collapsible>
	);

	//
}
