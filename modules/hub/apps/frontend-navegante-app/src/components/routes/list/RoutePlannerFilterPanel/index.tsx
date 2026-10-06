'use client';

import { type ReactNode } from 'react';

import styles from './styles.module.css';

/* * */

interface RoutePlannerFilterPanelProps {
	children: ReactNode
	footer?: ReactNode
	id?: string
	label: string
	selection: 'multiple' | 'single'
}

/* * */

export function RoutePlannerFilterPanel({ children, footer, id, label, selection }: RoutePlannerFilterPanelProps) {
	//

	//
	// A. Render components

	return (
		<div className={styles.filtersPanel} id={id}>
			<div aria-label={label} className={styles.filterGroup} role={selection === 'single' ? 'radiogroup' : 'group'}>
				{children}
			</div>
			{footer && <div className={styles.footer}>{footer}</div>}
		</div>
	);

	//
}
