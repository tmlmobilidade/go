/* * */

import { type ReactNode } from 'react';

import styles from './styles.module.css';

/* * */

export interface TransparentPaneProps {
	children?: ReactNode
}

/* * */

export function TransparentPane({ children }: TransparentPaneProps) {
	return (
		<div className={styles.container}>
			{children}
		</div>
	);
}
