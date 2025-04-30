'use client';

import { useStopDetailContext } from '@/contexts/StopDetail.context';
import { Collapsible, Grid, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export default function StopAdminInformation() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Informações sobre a localização administrativa e responsabilidade de gestão desta paragem"
			title="Informação Administrativa"
		>
			<Section gap="md">
				<Grid columns="abc" gap="md">
					<TextInput
						label="Município"
						maxLength={255}
						placeholder="Escolha uma opção..."
						{...stopDetailContext.data.form.getInputProps('municipality_id')}
					/>

					<TextInput
						label="Freguesia"
						maxLength={255}
						placeholder="Maçãs"
						{...stopDetailContext.data.form.getInputProps('parish_id')}
					/>

					<TextInput
						label="Localidade"
						maxLength={255}
						placeholder="Bairro das Maçãs"
						{...stopDetailContext.data.form.getInputProps('locality_id')}
					/>
				</Grid>

				<Grid gap="md">
					<TextInput
						label="Jurisdição"
						maxLength={255}
						placeholder="CM Moita"
						{...stopDetailContext.data.form.getInputProps('jurisdiction')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
