'use client';

import { IconCheck } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

export function FeedbackThankYou() {
	return (
		<div aria-live="polite" className={styles.container} role="status">
			<span className={styles.icon}>
				<IconCheck aria-hidden={true} size={36} stroke={2.6} />
			</span>
			<span className={styles.title}>Obrigado pelo feedback!</span>
			<span className={styles.description}>A tua resposta foi enviada.</span>
		</div>
	);
}
