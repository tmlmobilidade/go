'use client';

import { NoDataLabel } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function HomeWelcomeMessage() {
	return (
		<div className={styles.root}>
			<NoDataLabel text="GO" />
		</div>
	);
}
