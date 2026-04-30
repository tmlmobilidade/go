'use client';

/* * */

import { IconChevronLeft } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

export function AlertPublicDetailHeader() {
	//

	//
	// B. Render components

	return (
		<button className={styles.backButton} onClick={() => window.history.back()} type="button">
			<IconChevronLeft size={14} />
			<span>Voltar</span>
		</button>
	);

	//
}
