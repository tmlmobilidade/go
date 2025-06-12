'use client';

import { useStopsDetailContext } from '@/contexts/StopsDetail.context';
import { Collapsible, Grid, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function StopAdminInformation() {
	//

	const stopsDetailContext = useStopsDetailContext();

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
						{...stopsDetailContext.data.form.getInputProps('municipality_id')}
						disabled
					/>

					<TextInput
						label="Freguesia"
						maxLength={255}
						placeholder="Maçãs"
						{...stopsDetailContext.data.form.getInputProps('parish_id')}
						disabled
					/>

					<TextInput
						label="Localidade"
						maxLength={255}
						placeholder="Bairro das Maçãs"
						{...stopsDetailContext.data.form.getInputProps('locality_id')}
						disabled
					/>
				</Grid>

				<Grid gap="md">
					<TextInput
						label="Jurisdição"
						maxLength={255}
						placeholder="CM Moita"
						{...stopsDetailContext.data.form.getInputProps('jurisdiction')}
						disabled
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
