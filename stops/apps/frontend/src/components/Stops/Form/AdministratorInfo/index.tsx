'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Translations } from '@/lib/translations';
import { operationalStatusSchema } from '@tmlmobilidade/types';
import { Collapsible, Combobox, Grid, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function AdministratorInfo() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	const  = .options.map (value => ({
		label: Translations.[value],
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
						data={}
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
				<TextInput
					label="Jusrisdição"
					miw="100%"
					placeholder="CM Moita"
					{...stopDetailContext.data.form.getInputProps('jurisdiction')}
				/>
			</Section>

		</Collapsible>
	);

	//
}
