'use client';

import { type ReactNode, useId } from 'react';

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
	// A. Setup variables

	const labelId = useId();

	//
	// B. Render components

	return (
		<div className={styles.filtersPanel} id={id}>
			<div className={styles.filterSection}>
				<strong id={labelId}>{label}</strong>
				<div aria-labelledby={labelId} className={styles.filterGroup} role={selection === 'single' ? 'radiogroup' : 'group'}>
					{children}
				</div>
				{footer}
			</div>
		</div>
	);

	//
}
