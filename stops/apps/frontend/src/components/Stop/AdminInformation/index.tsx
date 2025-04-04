'use client';

/* * */

import Header from '@/components/common/Header';
import Row from '@/components/common/Row';
import Item from '@/components/common/Row/Item';

/* * */

import styles from '../styles.module.css';

/* * */

interface AdminInformationProps {
	jurisdication: string
	locality_id: string
	municipality_id: string
	parish: string
}

/* * */

export default function AdminInformation({ jurisdication, locality_id, municipality_id, parish }: AdminInformationProps) {
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
				<Item label="Município" placeholder="Escolha uma opção..." value={municipality_id} />
				<Item label="Freguesia" placeholder="Maçãs" value={parish} />
				<Item label="Localidade" placeholder="Bairro das Maçãs" value={locality_id} />
			</Row>

			<Row>
				<Item label="Jurisdição" placeholder="CM Moita" value={jurisdication} />
			</Row>
		</div>
	);
}
