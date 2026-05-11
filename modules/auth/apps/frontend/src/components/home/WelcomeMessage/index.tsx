'use client';

import { NoDataLabel } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function WelcomeMessage() {
	return (
		<div className={styles.root}>
			<NoDataLabel text="GO v2" />
		</div>
	);
}
