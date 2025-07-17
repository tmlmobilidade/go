'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Translations } from '@/lib/translations';
import { operationalStatusSchema } from '@tmlmobilidade/types';
import { Collapsible, Combobox, Grid, Pane, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function Allocation() {
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
		<Pane>
			<Collapsible
				description="Informação Administrativa"
				title="Informações sobre a localização administrativa e responsabilidade de gestão desta paragem."
			>
				<Section>
					<Grid columns="abc" gap="sm">
						<Combobox
							data={operationalStatusItems}
							label="Município"
							placeholder="Escolha uma opção"
							fullWidth
							{...stopDetailContext.data.form.getInputProps('municipality_id')}
						/>
						<TextInput
							label="Freguesia"
							placeholder="..."
							{...stopDetailContext.data.form.getInputProps('parish_id')}
						/>
						<TextInput
							label="Localidade"
							placeholder="..."
							{...stopDetailContext.data.form.getInputProps('locality_id')}
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
		</Pane>
	);

	//
}
