'use client';

import { type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

export function NonAuthenticatedWrapper({ children }: PropsWithChildren) {
	return (
		<div className={styles.root}>
			{children}
		</div>
	);
}
