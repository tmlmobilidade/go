'use client';

/* * */

import Header from '@/components/common/Header';
import Row from '@/components/common/Row';
import Item from '@/components/common/Row/Item';

/* * */

import { ShelterStatus, UnixTimestamp } from '@tmlmobilidade/types';

import styles from '../styles.module.css';

/* * */

enum ShelterStatusValues {
	is_damaged = 'Abrigo Danificado',
	is_missing = 'Abrigo em Falta',
	is_ok = 'Abrigo Operacional',
	not_applicable = 'Não Aplicável',
	unknown = 'Abrigo Desconhecido',
}

const shelterStatusValues = [
	'is_damaged',
	'is_missing',
	'is_ok',
	'not_applicable',
	'unknown',
];

interface ShelterProps {
	last_shelter_installation: object
	shelter_code: object
	shelter_maintainer: object
	shelter_make: object
	shelter_model: object
	shelter_status: object
	// last_shelter_installation: UnixTimestamp
	// shelter_code: string
	// shelter_maintainer: string
	// shelter_make: string
	// shelter_model: string
	// shelter_status: ShelterStatus
}

export default function Shelter({ last_shelter_installation, shelter_code, shelter_maintainer, shelter_make, shelter_model, shelter_status }: ShelterProps) {
	//

	//
	// A. Render components

	return (
		<div className={styles.section}>
			<Header
				description="Informações relacionadas com o abrigo."
				title="Abrigo"
			/>

			<Row>
				<Item
					comboBoxValues={shelterStatusValues}
					inputProps={shelter_status}
					isComboBox={true}
					label="Existe Abrigo?"
				/>
				<Item
					inputProps={shelter_code}
					label="Código do Abrigo"
					placeholder="SH1234"
				/>
				<Item
					inputProps={shelter_maintainer}
					label="Entidade Gestora do Abrigo"
					placeholder="JC Decaux"
				/>
			</Row>

			<Row>
				<Item
					inputProps={shelter_model}
					label="Modelo do Abrigo"
				/>
				<Item
					inputProps={shelter_make}
					label="Fabricante do Abrigo"
				/>
			</Row>
			{/* <Item label="Última verificação do estado do abrigo" placeholder="2024-09-12" value="Sim" /> */}
			{/* <Row>
				<Item label="Data de Instalação do Abrigo" placeholder="2024-09" value={last_shelter_installation} />
			</Row> */}
		</div>
	);
}
