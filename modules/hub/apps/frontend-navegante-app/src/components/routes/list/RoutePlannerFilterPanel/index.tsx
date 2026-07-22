'use client';

import { type ReactNode } from 'react';

import styles from './styles.module.css';

/* * */

interface RoutePlannerFilterPanelProps {
	children: ReactNode
	footer?: ReactNode
	label: string
}

/* * */

export function RoutePlannerFilterPanel({ children, footer, label }: RoutePlannerFilterPanelProps) {
	return (
		<div className={styles.filtersPanel}>
			<div className={styles.filterSection}>
				<strong>{label}</strong>
				<div className={styles.filterGroup}>{children}</div>
				{footer}
			</div>
		</div>
	);
}
