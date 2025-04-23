'use client';

/* * */

import Header from '@/components/common/Header';
import Row from '@/components/common/Row';
import Item from '@/components/common/Row/Item';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetail.context';
import { ShelterStatus, UnixTimestamp } from '@tmlmobilidade/types';
import { getUnixTimestampFromJSDate } from '@tmlmobilidade/utils';

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
	last_shelter_installation_getter: Date | number | string
	last_shelter_installation_setter: (date: Date) => void
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

export default function Shelter() {
// export default function Shelter({
// 	last_shelter_installation,
// 	last_shelter_installation_getter,
// 	last_shelter_installation_setter,
// 	shelter_code,
// 	shelter_maintainer,
// 	shelter_make,
// 	shelter_model,
// 	shelter_status,
// }: ShelterProps) {

	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	const last_shelter_installation = stopDetailContext.data.form.getInputProps('last_shelter_installation');
	const last_shelter_installation_getter = stopDetailContext.data.form.getValues().last_shelter_installation;
	const shelter_code = stopDetailContext.data.form.getInputProps('shelter_code');
	const shelter_maintainer = stopDetailContext.data.form.getInputProps('shelter_maintainer');
	const shelter_make = stopDetailContext.data.form.getInputProps('shelter_make');
	const shelter_model = stopDetailContext.data.form.getInputProps('shelter_model');
	const shelter_status = stopDetailContext.data.form.getInputProps('shelter_status');
	//
	// A. Transform data

	const shelterStatusItems = shelterStatusValues.map(el => ({
		label: ShelterStatusValues[el],
		value: el,
	}));

	const last_shelter_installation_setter = (date: Date) => {
		stopDetailContext.data.form.setFieldValue('last_shelter_installation', getUnixTimestampFromJSDate(date));
	};

	const last_shelter_installation_date = new Date(last_shelter_installation_getter);

	//
	// B. Render components

	return (
		<div className={styles.section}>
			<Header
				description="Informações relacionadas com o abrigo."
				title="Abrigo"
			/>

			<Row>
				<Item
					comboBoxValues={shelterStatusItems}
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

			<Row>
				<Item
					date={last_shelter_installation_date}
					dateSetter={last_shelter_installation_setter}
					inputProps={last_shelter_installation}
					isDatePicker={true}
					label="Data de Instalação do Abrigo"
					placeholder="2024-09"
				/>
			</Row>
		</div>
	);
}
