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

	const connections = [
		'airport',
		'bike_parking',
		'bike_sharing',
		'boat',
		'car_parking',
		'ferry',
		'light_rail',
		'subway',
		'train',
	];

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
				<Grid columns="abcd" gap="md">
					{connections.map((connection, index) => {
						return (
							<div key={index} className={styles.inputCheckboxContainer}>
								<Checkbox
									checked={stopDetailContext.data.form.getInputProps('connections').value.includes(connection)}
									className={styles.inputCheckbox}
									label={ConnectionsValues[connection]}
									onChange={(_) => {
										stopDetailContext.actions.handleConnectionsChange(connection);
									}}
								/>
							</div>
						);
					})}
				</Grid>
			</Section>
		</Collapsible>
	);
}
