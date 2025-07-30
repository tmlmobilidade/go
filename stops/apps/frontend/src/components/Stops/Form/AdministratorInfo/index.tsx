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
				<Grid columns="ab" gap="sm">
					<TextInput
						disabled={true}
						label="Município"
						miw="100%"
						placeholder="Escolha uma opção"
						{...stopDetailContext.data.form.getInputProps('municipality_id')}
					/>
					<TextInput
						disabled={true}
						label="Distrito"
						miw="100%"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('district_id')}
					/>
					<TextInput
						disabled={true}
						label="Freguesia"
						miw="100%"
						placeholder="Maçãs"
						{...stopDetailContext.data.form.getInputProps('parish_id')}
					/>
					<TextInput
						disabled={true}
						label="Localidade"
						miw="100%"
						{...stopDetailContext.data.form.getInputProps('locality_id')}
					/>
				</Grid>
			</Section>
			<Section>
				<Combobox
					data={jurisdictionItems}
					defaultValue={Translations.JURISDICATION.unknown}
					disabled={true}
					label="Jusrisdição"
					fullWidth
					{...stopDetailContext.data.form.getInputProps('jurisdiction')}
				/>
			</Section>

		</Collapsible>
	);

	//
}
