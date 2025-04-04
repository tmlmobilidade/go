'use client';

/* * */

import Header from '@/components/common/Header';
import Row from '@/components/common/Row';
import Item from '@/components/common/Row/Item';

/* * */

import styles from '../styles.module.css';

/* * */

export default function Accessibility() {
	//

	//
	// A. Render components

	return (
		<div className={styles.section}>
			<Header
				description="Informações sobre a acessibilidade da paragem e sua envolvente."
				title="Acessibilidade"
			/>

			<Row>
				<Item label="Tem Passeio?" value="Desconhecido" />
				<Item label="Tipo de Passeio" placeholder="Calçada Portuguesa, Betão" value="Sim" />
			</Row>

			<Row>
				<Item label="Tem Passadeira?" value="Desconhecido" />
				<Item label="Tem Acesso Rebaixado/Contínuo?" value="Desconhecido" />
				<Item label="Tem Acesso Largo?" value="Desconhecido" />
				<Item label="Tem Pavimento Tátil?" value="Desconhecido" />
			</Row>

			<Row>
				<Item label="Tem Estacionamento Abusivo?" value="Desconhecido" />
				<Item label="Permite Embarque de PMR?" value="Desconhecido" />
			</Row>

			<Row>
				<Item label="Última Manutenção da Acessibilidade" placeholder="2023-02-10" value="Sim" />
				<Item label="Última Verificação da Acessibilidade" placeholder="2023-02-10" value="Sim" />
			</Row>
		</div>
	);
}
