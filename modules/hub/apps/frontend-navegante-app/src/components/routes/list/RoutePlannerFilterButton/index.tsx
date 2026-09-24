'use client';

import { type ReactNode, useId } from 'react';

import styles from './styles.module.css';

/* * */

interface RoutePlannerFilterButtonProps {
	ariaControls?: string
	ariaExpanded?: boolean
	children: ReactNode
	isActive: boolean
	name?: string
	onClick: () => void
	selection?: 'checkbox' | 'radio'
	value?: string
	variant?: 'option' | 'trigger'
}

/* * */

export function RoutePlannerFilterButton({ ariaControls, ariaExpanded, children, isActive, name, onClick, selection, value, variant = 'option' }: RoutePlannerFilterButtonProps) {
	const inputId = useId();

	if (selection) {
		return (
			<label className={styles.filterButton} data-active={isActive} data-variant={variant} htmlFor={inputId}>
				<input
					checked={isActive}
					className={styles.nativeControl}
					id={inputId}
					name={name}
					onChange={onClick}
					type={selection}
					value={value}
				/>
				{children}
			</label>
		);
	}

	return (
		<button
			aria-controls={ariaControls}
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
