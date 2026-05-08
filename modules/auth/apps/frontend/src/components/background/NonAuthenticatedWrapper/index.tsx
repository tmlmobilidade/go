'use client';

import { Background4 } from '@/components/background/Background4';
import { type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

export function NonAuthenticatedWrapper({ children }: PropsWithChildren) {
	return (
		<div className={styles.root}>
			<Background4 />
			{children}
		</div>
	);
}
