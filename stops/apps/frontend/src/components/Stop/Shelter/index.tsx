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

interface ShelterProps {
	last_shelter_installation: UnixTimestamp
	shelter_code: string
	shelter_maintainer: string
	shelter_make: string
	shelter_model: string
	shelter_status: ShelterStatus
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
				<Item label="Existe Abrigo?" value={ShelterStatusValues[shelter_status]} />
				<Item label="Código do Abrigo" placeholder="SH1234" value={shelter_code} />
				<Item label="Entidade Gestora do Abrigo" placeholder="JC Decaux" value={shelter_maintainer} />
			</Row>

			<Row>
				<Item label="Modelo do Abrigo" value={shelter_model} />
				<Item label="Fabricante do Abrigo" value={shelter_make} />
			</Row>
			{/* <Item label="Última verificação do estado do abrigo" placeholder="2024-09-12" value="Sim" /> */}
			{/* <Row>
				<Item label="Data de Instalação do Abrigo" placeholder="2024-09" value={last_shelter_installation} />
			</Row> */}
		</div>
	);
}
