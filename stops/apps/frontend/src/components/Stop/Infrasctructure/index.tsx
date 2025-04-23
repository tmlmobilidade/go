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
	last_infrastructure_check_getter: Date | number | string
	last_infrastructure_check_setter: (date: Date) => void
	last_infrastructure_maintenance: UnixTimestamp
	last_infrastructure_maintenance_getter: Date | number | string
	last_infrastructure_maintenance_setter: (date: Date) => void
}

export default function Infrasctructure({
	last_infrastructure_check,
	last_infrastructure_check_getter,
	last_infrastructure_check_setter,
	last_infrastructure_maintenance,
	last_infrastructure_maintenance_getter,
	last_infrastructure_maintenance_setter,
}: InfrasctructureProps) {
	//

	//
	// A. Transform data

	const last_infrastructure_check_date = new Date(last_infrastructure_check_getter);

	const last_infrastructure_maintenance_date = new Date(last_infrastructure_maintenance_getter);

	//
	// B. Render components

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
				<Item
					date={last_infrastructure_check_date}
					dateSetter={last_infrastructure_check_setter}
					inputProps={last_infrastructure_check}
					isDatePicker={true}
					label="Última Manutenção da Infraestrutura"
					placeholder="2023-02-10"
				/>

				<Item
					date={last_infrastructure_maintenance_date}
					dateSetter={last_infrastructure_maintenance_setter}
					inputProps={last_infrastructure_maintenance}
					isDatePicker={true}
					label="Última Verificação da Infraestrutura"
					placeholder="2023-02-10"
				/>
			</Row>
		</div>
	);
}
