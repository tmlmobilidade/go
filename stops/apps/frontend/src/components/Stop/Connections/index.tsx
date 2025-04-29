'use client';

import { useStopDetailContext } from '@/contexts/StopDetail.context';
import { Checkbox, Collapsible, Grid, Section } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export default function Connections() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	const AIRPORT = 'airport';
	const BIKE_PARKING = 'bike_parking';
	const BIKE_SHARING = 'bike_sharing';
	const BOAT = 'boat';
	const CAR_PARKING = 'car_parking';
	const FERRY = 'ferry';
	const LIGHT_RAIL = 'light_rail';
	const SUBWAY = 'subway';
	const TRAIN = 'train';

	enum ConnectionsValues {
		airport = 'Aeroporto',
		bike_parking = 'Estacionamento de Bicicletas',
		bike_sharing = 'Partilha de Bicicletas',
		boat = 'Barco',
		car_parking = 'Parque Automóvel',
		ferry = 'Ferróvia',
		light_rail = 'Metro de Superfície',
		subway = 'Metro',
		train = 'Comboio',
	}

	//
	// B. Render components

	return (
		<Collapsible
			description="Quais são os outros modos de transporte, para além do autocarro, que esteja paragem serve."
			title="Ligações Intermodais"
		>
			<Section gap="md">
				<Grid className={styles.grid} columns="abcd">
					<div className={styles.input_checkbox_container}>
						<Checkbox
							checked={stopDetailContext.data.form.getInputProps('connections').value.includes(SUBWAY)}
							className={styles.input_checkbox}
							label={ConnectionsValues[SUBWAY]}
							{...stopDetailContext.data.form.getInputProps('connections')}
						/>
					</div>

					<div className={styles.input_checkbox_container}>
						<Checkbox
							checked={stopDetailContext.data.form.getInputProps('connections').value.includes(LIGHT_RAIL)}
							className={styles.input_checkbox}
							label={ConnectionsValues[LIGHT_RAIL]}
							{...stopDetailContext.data.form.getInputProps('connections')}
						/>
					</div>

					<div className={styles.input_checkbox_container}>
						<Checkbox
							checked={stopDetailContext.data.form.getInputProps('connections').value.includes(TRAIN)}
							className={styles.input_checkbox}
							label={ConnectionsValues[TRAIN]}
							{...stopDetailContext.data.form.getInputProps('connections')}
						/>
					</div>

					<div className={styles.input_checkbox_container}>
						<Checkbox
							checked={stopDetailContext.data.form.getInputProps('connections').value.includes(BOAT)}
							className={styles.input_checkbox}
							label={ConnectionsValues[BOAT]}
							{...stopDetailContext.data.form.getInputProps('connections')}
						/>
					</div>
				</Grid>

				<Grid className={styles.grid} columns="abcd">
					<div className={styles.input_checkbox_container}>
						<Checkbox
							checked={stopDetailContext.data.form.getInputProps('connections').value.includes(BIKE_SHARING)}
							className={styles.input_checkbox}
							label={ConnectionsValues[BIKE_SHARING]}
							{...stopDetailContext.data.form.getInputProps('connections')}
						/>
					</div>

					<div className={styles.input_checkbox_container}>
						<Checkbox
							checked={stopDetailContext.data.form.getInputProps('connections').value.includes(AIRPORT)}
							className={styles.input_checkbox}
							label={ConnectionsValues[AIRPORT]}
							{...stopDetailContext.data.form.getInputProps('connections')}
						/>
					</div>

					<div className={styles.input_checkbox_container}>
						<Checkbox
							checked={stopDetailContext.data.form.getInputProps('connections').value.includes(BIKE_PARKING)}
							className={styles.input_checkbox}
							label={ConnectionsValues[BIKE_PARKING]}
							{...stopDetailContext.data.form.getInputProps('connections')}
						/>
					</div>

					<div className={styles.input_checkbox_container}>
						<Checkbox
							checked={stopDetailContext.data.form.getInputProps('connections').value.includes(CAR_PARKING)}
							className={styles.input_checkbox}
							label={ConnectionsValues[CAR_PARKING]}
							{...stopDetailContext.data.form.getInputProps('connections')}
						/>
					</div>
				</Grid>

				<Grid className={styles.grid} columns="abcd">
					<div className={styles.input_checkbox_container}>
						<Checkbox
							checked={stopDetailContext.data.form.getInputProps('connections').value.includes(FERRY)}
							className={styles.input_checkbox}
							label={ConnectionsValues[FERRY]}
							{...stopDetailContext.data.form.getInputProps('connections')}
						/>
					</div>
				</Grid>
			</Section>
		</Collapsible>
	);
}
