/* * */

import { type ReactNode } from 'react';

import styles from './styles.module.css';

/* * */

interface ValueDisplayProps {
	bordered?: boolean
	label: string
	raised?: boolean
	value: ReactNode | string
}

/* * */

export function ValueDisplay({ bordered, label, raised, value }: ValueDisplayProps) {
	return (
		<div className={styles.container} data-bordered={bordered} data-raised={raised}>
			<p className={styles.label}>{label}</p>
			<p className={styles.value}>{value}</p>
		</div>
	);
}
