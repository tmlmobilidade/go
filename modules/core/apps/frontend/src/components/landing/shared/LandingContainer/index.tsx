'use client';

import { type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

export function LandingSection({ children }: PropsWithChildren) {
	return (
		<section className={styles.section}>
			{children}
		</section>
	);
}
