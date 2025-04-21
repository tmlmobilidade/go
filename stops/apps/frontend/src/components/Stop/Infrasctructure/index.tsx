'use client';

/* * */

import Header from '@/components/common/Header';
import Row from '@/components/common/Row';
import Item from '@/components/common/Row/Item';

/* * */

import { UnixTimestamp } from '@tmlmobilidade/types';

import styles from '../styles.module.css';

/* * */

interface InfrasctructureProps {
	last_infrastructure_check: UnixTimestamp
	last_infrastructure_maintenance: UnixTimestamp
}

export default function Infrasctructure({ last_infrastructure_check, last_infrastructure_maintenance }: InfrasctructureProps) {
	//

	//
	// A. Render components

	return (
		<div className={styles.section}>
			{/* Header */}
			<Header
				description="Informações relacionadas com os equipamentos da paragem e envolvente."
				title="Infraestrutura"
			/>

			{/* <Row>
				<Item label="Existe Poste?" value="Desconhecido" />
				<Item label="Existe Cobertura?" value="Desconhecido" />
			</Row>

			<Row>
				<Item label="Existe Mupi?" value="Desconhecido" />
				<Item label="Existe Banco?" value="Desconhecido" />
				<Item label="Existe Papeleira?" value="Desconhecido" />
			</Row>

			<Row>
				<Item label="Existe Iluminação?" value="Desconhecido" />
				<Item label="Existe Ligação Elétrica?" value="Desconhecido" />
			</Row>

			<Row>
				<Item label="Tipo de Relação com a Via" value="Desconhecido" />
			</Row> */}

			<Row>
				<Item label="Última Manutenção da Infraestrutura" placeholder="2023-02-10" value="Sim" />
				<Item label="Última Verificação da Infraestrutura" placeholder="2023-02-10" value="Sim" />
			</Row>
		</div>
	);
}
