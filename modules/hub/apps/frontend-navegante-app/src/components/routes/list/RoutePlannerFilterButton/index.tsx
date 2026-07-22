'use client';

import { type ReactNode } from 'react';

import styles from './styles.module.css';

/* * */

interface RoutePlannerFilterButtonProps {
	children: ReactNode
	isActive: boolean
	onClick: () => void
}

/* * */

export function RoutePlannerFilterButton({ children, isActive, onClick }: RoutePlannerFilterButtonProps) {
	return (
		<button
			className={styles.filterButton}
			data-active={isActive}
			onClick={onClick}
			type="button"
		>
			{children}
		</button>
	);
}
