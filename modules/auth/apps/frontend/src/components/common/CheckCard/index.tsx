'use client';

import { Checkbox, Description } from '@tmlmobilidade/ui';
import { type KeyboardEvent, type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

export interface CheckCardProps {
	checked: boolean
	description?: string
	disabled?: boolean
	footnote?: string
	label: string
	onChange: (checked: boolean) => void
}

export function CheckCard({ checked, children, description, disabled = false, footnote, label, onChange }: PropsWithChildren<CheckCardProps>) {
	//

	//
	// A. Handle actions

	const handleToggle = () => {
		if (disabled) return;
		onChange(!checked);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		// Handle toggle on Space or Enter key
		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			handleToggle();
		}
	};

	//
	// B. Render components

	return (
		<div
			aria-checked={checked}
			aria-disabled={disabled}
			className={styles.root}
			onClick={handleToggle}
			onKeyDown={handleKeyDown}
			role="checkbox"
			tabIndex={disabled ? -1 : 0}
		>
			<Checkbox
				checked={checked}
				description={description}
				disabled={disabled}
				label={label}
				onChange={handleToggle}
			/>
			<div
				aria-disabled={!checked || disabled}
				className={styles.children}
				onClick={(e) => {
					if (disabled || !checked) return;
					e.stopPropagation();
				}}
				onKeyDown={(e) => {
					if (disabled || !checked) return;
					if (e.key === ' ' || e.key === 'Enter') {
						e.stopPropagation();
					}
				}}
			>
				{children}
			</div>
			{footnote && <Description>{footnote}</Description>}
		</div>
	);

	//
}
