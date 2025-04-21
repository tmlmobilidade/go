'use client';

/* * */

import Header from '@/components/common/Header';
import Row from '@/components/common/Row';
import Item from '@/components/common/Row/Item';

/* * */

import { UnixTimestamp } from '@tmlmobilidade/types';

import styles from '../styles.module.css';

/* * */

interface PublicInformationProps {
	last_schedules_check: UnixTimestamp
	last_schedules_maintenance: UnixTimestamp
}

export default function PublicInformation({ last_schedules_check, last_schedules_maintenance }: PublicInformationProps) {
	//

	//
	// A. Render components

	return (
		<div className={styles.section}>
			<Header
				description="Informações relacionadas com os suportes de informação ao público."
				title="Informação ao Público"
			/>

			{/* <Row>
				<Item label="Tem Postalete" value="Desconhecido" />
				<Item label="Entidade Gestora do Postalete" placeholder="Alsa Todi" value="Sim" />
			</Row>

			<Row>
				<Item label="Tem Moldura?" value="Desconhecido" />
			</Row>

			<Row>
				<Item label="Tem PIP Áudio?" value="Desconhecido" />
			</Row>
			<Item label="Código do PIP Áudio" placeholder="PIPA372" value="Sim" />

			<Row>
				<Item label="Tem PIP Realtime?" value="Desconhecido" />
				<Item label="Código do PIP Realtime" placeholder="PIPRT372" value="Sim" />
			</Row>

			<Row>
				<Item label="Tem Sinalização H2OA?" value="Desconhecido" />
			</Row>

			<Row>
				<Item label="Tem Horários?" value="Desconhecido" />
				<Item label="Tem Horários Táteis?" value="Desconhecido" />
			</Row>

			<Row>
				<Item label="Tem Mapa da Rede?" value="Desconhecido" />
			</Row> */}

			<Row>
				<Item label="Última Manutenção dos Horários" placeholder="2023-02-10" value="Sim" />
				<Item label="Última Verificação dos Horários" placeholder="2023-02-10" value="Sim" />
			</Row>

			{/* <Row>
				<Item label="Última Manutenção do Postalete" placeholder="2023-02-10" value="Sim" />
				<Item label="Última Verificação dos Postalete" placeholder="2023-02-10" value="Sim" />
			</Row> */}
		</div>
	);
}
