/* * */

import { IconGhostFilled } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

interface ErrorDisplayProps {
	message?: string
}

/* * */

export function ErrorDisplay({ message }: ErrorDisplayProps) {
	return (
		<div className={styles.root}>
			<IconGhostFilled size={75} />
			<h5 className={styles.title}>Ocorreu um erro</h5>
			{message && <p className={styles.message}>{message}</p>}
		</div>
	);
}
