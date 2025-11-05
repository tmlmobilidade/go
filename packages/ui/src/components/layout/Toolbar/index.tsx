/* * */

import { type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

export function Toolbar({ children }: PropsWithChildren) {
	return (
		<div className={styles.toolbar}>
			{children}
		</div>
	);
}
