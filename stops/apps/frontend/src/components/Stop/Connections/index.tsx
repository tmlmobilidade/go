'use client';

/* * */

import Header from '@/components/common/Header';
import Item from '@/components/common/Row/Item';
import { Grid } from '@tmlmobilidade/ui';

/* * */

import { Connections as ConnectionsType } from '@tmlmobilidade/types';

import styles from '../styles.module.css';

/* * */

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

interface ConnectionsProps {
	connections: ConnectionsType
}

export default function Connections({ connections }: ConnectionsProps) {
	//

	//
	// A. Render components

	return (
		<div className={styles.section}>
			<Header
				description="Quais são os outros modos de transporte, para além do autocarro, que esteja paragem serve."
				title="Ligações Intermodais"
			/>

			<Grid className={styles.grid} columns="abcd">
				<Item label={ConnectionsValues[SUBWAY]} value={connections.includes(SUBWAY)} />
				<Item label={ConnectionsValues[LIGHT_RAIL]} value={connections.includes(LIGHT_RAIL)} />
				<Item label={ConnectionsValues[TRAIN]} value={connections.includes(TRAIN)} />
				<Item label={ConnectionsValues[BOAT]} value={connections.includes(BOAT)} />

				<Item label={ConnectionsValues[BIKE_SHARING]} value={connections.includes(BIKE_SHARING)} />
				<Item label={ConnectionsValues[AIRPORT]} value={connections.includes(AIRPORT)} />
				<Item label={ConnectionsValues[BIKE_PARKING]} value={connections.includes(BIKE_PARKING)} />
				<Item label={ConnectionsValues[CAR_PARKING]} value={connections.includes(CAR_PARKING)} />

				<Item label={ConnectionsValues[FERRY]} value={connections.includes(FERRY)} />
			</Grid>
		</div>
	);
}
