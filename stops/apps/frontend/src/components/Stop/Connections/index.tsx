'use client';

/* * */

import Header from '@/components/common/Header';
import Item from '@/components/common/Row/Item';
import { Grid } from '@tmlmobilidade/ui';

/* * */

import styles from '../styles.module.css';

/* * */

export default function Connections() {
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
				<Item label="Metro" value={true} />
				<Item label="Metro de Superfície" value={true} />
				<Item label="Comboio" value={false} />
				<Item label="Barco" value={true} />

				<Item label="Partilha de Bicicletas" value={true} />
				<Item label="Aeroporto" value={false} />
				<Item label="Estacionamento de Bicicletas" value={true} />
				<Item label="Estacionamento Automóvel" value={true} />
			</Grid>
		</div>
	);
}
