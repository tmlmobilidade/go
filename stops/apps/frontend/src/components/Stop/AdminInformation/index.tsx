'use client';

/* * */

import Header from '@/components/common/Header';
import Row from '@/components/common/Row';
import Item from '@/components/common/Row/Item';

/* * */

import styles from '../styles.module.css';

/* * */

interface AdminInformationProps {
	jurisdication: object
	locality_id: object
	municipality_id: object
	parish_id: object
}

/* * */

export default function AdminInformation({ jurisdication, locality_id, municipality_id, parish_id }: AdminInformationProps) {
	//

	//
	// A. Render components

	return (
		<div className={styles.section}>
			<Header
				description="Informações sobre a localização administrativa e responsabilidade de gestão desta paragem"
				title="Informação Administrativa"
			/>

			<Row>
				<Item
					inputProps={municipality_id}
					label="Município"
					placeholder="Escolha uma opção..."
				/>
				<Item
					inputProps={parish_id}
					label="Freguesia"
					placeholder="Maçãs"
				/>
				<Item
					inputProps={locality_id}
					label="Localidade"
					placeholder="Bairro das Maçãs"
				/>
			</Row>

			<Row>
				<Item
					inputProps={jurisdication}
					label="Jurisdição"
					placeholder="CM Moita"
				/>
			</Row>
		</div>
	);
}
