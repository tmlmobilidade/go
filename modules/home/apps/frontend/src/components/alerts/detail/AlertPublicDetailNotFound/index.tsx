'use client';

/* * */

import { Description, Section, Surface } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function AlertPublicDetailNotFound() {
	//

	//
	// A. Render components

	return (
		<Surface>
			<Section gap="lg">
				<div className={styles.descriptionCard}>
					<Description>Alerta não encontrado.</Description>
				</div>
			</Section>
		</Surface>
	);

	//
}
