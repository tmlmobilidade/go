'use client';

/* * */

import Header from '@/components/common/Header';
import Row from '@/components/common/Row';
import Item from '@/components/common/Row/Item';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetail.context';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

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
export default function AdminInformation() {
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
					<Item
						inputProps={stopDetailContext.data.form.getInputProps('municipality_id')}
						label="Município"
						placeholder="Escolha uma opção..."
					/>
					<Item
						inputProps={stopDetailContext.data.form.getInputProps('parish_id')}
						label="Freguesia"
						placeholder="Maçãs"
					/>
					<Item
						inputProps={stopDetailContext.data.form.getInputProps('locality_id')}
						label="Localidade"
						placeholder="Bairro das Maçãs"
					/>
				</Grid>

				<Grid gap="md">
					<Item
						inputProps={stopDetailContext.data.form.getInputProps('jurisdiction')}
						label="Jurisdição"
						placeholder="CM Moita"
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
