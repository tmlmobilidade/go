'use client';

import { Checkbox, Description, Label, Section } from '@tmlmobilidade/ui';
import React, { useCallback } from 'react';

import styles from './styles.module.css';

export interface CheckCardProps {
	checked: boolean
	children?: React.ReactNode
	description: string
	disabled?: boolean
	label: string
	onChange: (checked: boolean) => void
}

export default function CheckCard({
	checked,
	children,
	description,
	disabled = false,
	label,
	onChange,
}: CheckCardProps) {
	const handleChange = useCallback(
		(newChecked: boolean) => {
			if (!disabled) {
				onChange(newChecked);
			}
		},
		[disabled, onChange],
	);

	const handleCardClick = useCallback(() => {
		handleChange(!checked);
	}, [checked, handleChange]);

	return (
		<div
			aria-checked={checked}
			aria-disabled={disabled}
			className={`${styles.root} ${disabled ? styles.disabled : ''}`}
			onClick={disabled ? undefined : handleCardClick}
			role="checkbox"
			tabIndex={disabled ? -1 : 0}
			onKeyDown={
				disabled
					? undefined
					: (e) => {
						if (e.key === ' ' || e.key === 'Enter') {
							e.preventDefault();
							handleCardClick();
						}
					}
			}
		>
			<Section flexDirection="row" gap="sm" padding="none">
				<div className={styles.checkbox}>
					<Checkbox
						checked={checked}
						disabled={disabled}
						onChange={() => handleChange(!checked)}
					/>
				</div>

				<div className={styles.content}>
					<Label>{label}</Label>
					<Description>{description}</Description>
				</div>
			</Section>
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
		</div>
	);
}
