/* * */

import { Section } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function VehiclesMapHeader() {
	return (
		<Section>
			<h2 className={styles.title}>Veículos em movimento</h2>
			<p className={styles.description}>A rede de veículos em tempo real na Área Metropolitana de Lisboa.</p>
		</Section>
	);
}
