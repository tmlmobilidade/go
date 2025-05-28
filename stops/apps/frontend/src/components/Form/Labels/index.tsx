'use client';

import { IconNumber1, IconNumber2, IconNumber3, IconSeparator } from '@tabler/icons-react';
import React from 'react';

import styles from './styles.module.css';

enum Phase {
	CONFIRMATION = 'CONFIRMATION',
	IDENTIFICATION = 'IDENTIFICATION',
	LOCATION = 'LOCATION',
}

export function Labels({ phase }) {
	//

	//
	// A. Render components
	return (
		<div className={styles.container}>
			<div className={styles.section}>
				<IconNumber1 className={phase === Phase.LOCATION ? styles.active : ''} />
				<div>
					<div>Localização</div>
					<div className={styles.description}>Definir coordenadas</div>
				</div>
			</div>

			<div className={styles.section}>
				<IconSeparator />
			</div>

			<div className={styles.section}>
				<IconNumber2 className={phase === Phase.IDENTIFICATION ? styles.active : ''} />
				<div>
					<div>Identificação</div>
					<div className={styles.description}>Nomes e morada</div>
				</div>
			</div>

			<div className={styles.section}>
				<IconSeparator />
			</div>

			<div className={styles.section}>
				<IconNumber3 className={phase === Phase.CONFIRMATION ? styles.active : ''} />
				<div>
					<div>Confirmação</div>
					<div className={styles.description}>Resumo da nova paragem</div>
				</div>
			</div>
		</div>
	);
}
