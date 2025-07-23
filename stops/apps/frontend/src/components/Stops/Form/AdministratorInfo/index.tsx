'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Translations } from '@/lib/translations';
import { jurisdictionSchema } from '@tmlmobilidade/types';
import { Collapsible, Combobox, Grid, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function AdministratorInfo() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

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
					<TextInput
						label="Município"
						miw="100%"
						placeholder="Escolha uma opção"
						{...stopDetailContext.data.form.getInputProps('municipality_id')}
					/>
					<TextInput
						label="Freguesia"
						miw="100%"
						placeholder="Maçãs"
						{...stopDetailContext.data.form.getInputProps('parish_id')}
					/>
					<TextInput
						label="Localidade"
						miw="100%"
						{...stopDetailContext.data.form.getInputProps('locality')}
					/>
				</Grid>
			</Section>
			<Section>
				<Combobox
					data={jurisdictionItems}
					defaultValue={Translations.JURISDICATION.unknown}
					label="Jusrisdição"
					fullWidth
					{...stopDetailContext.data.form.getInputProps('jurisdiction')}
				/>
			</Section>

		</Collapsible>
	);

	//
}
