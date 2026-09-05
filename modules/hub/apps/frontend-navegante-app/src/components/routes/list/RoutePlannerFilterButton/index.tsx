'use client';

import { type ReactNode } from 'react';

import styles from './styles.module.css';

/* * */

interface RoutePlannerFilterButtonProps {
	ariaExpanded?: boolean
	children: ReactNode
	isActive: boolean
	onClick: () => void
	variant?: 'option' | 'trigger'
}

/* * */

export function RoutePlannerFilterButton({ ariaExpanded, children, isActive, onClick, variant = 'option' }: RoutePlannerFilterButtonProps) {
	return (
		<button
			aria-expanded={ariaExpanded}
			className={styles.filterButton}
			data-active={isActive}
			data-variant={variant}
			onClick={onClick}
			type="button"
		>
			{children}
		</button>
	);
}
