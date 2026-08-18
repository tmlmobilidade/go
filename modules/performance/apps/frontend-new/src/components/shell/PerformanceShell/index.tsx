'use client';

/* * */

import { FilterBar } from '@/components/shell/FilterBar';
import { PerformanceNavigation } from '@/components/shell/PerformanceNavigation';
import { Surface } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

export function PerformanceShell({ children }: PropsWithChildren) {
	return (
		<Surface className={styles.root} height="full">
			<header className={styles.header}>
				<FilterBar />
				<PerformanceNavigation />
			</header>
			<main className={styles.content}>{children}</main>
		</Surface>
	);
}
