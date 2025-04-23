'use client';

/* * */

import Header from '@/components/common/Header';
import Row from '@/components/common/Row';
import Item from '@/components/common/Row/Item';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetail.context';
import { Collapsible, Grid, Section, TextInput } from '@tmlmobilidade/ui';

import styles from '../styles.module.css';

/* * */

interface AdminInformationProps {
	jurisdication: object
	locality_id: object
	municipality_id: object
	parish_id: object
}

/* * */

// export default function AdminInformation({ jurisdication, locality_id, municipality_id, parish_id }: AdminInformationProps) {
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
