'use client';

import { Badge as MantineBadge, BadgeProps as MantineBadgeProps } from '@mantine/core';
import React from 'react';

import styles from './styles.module.css';

import { cn } from '../../../lib/utils';

/* * */

export interface BadgeProps extends MantineBadgeProps {
	children?: React.ReactNode
	disabled?: boolean
	filled?: boolean
	fullWidth?: boolean
	icon?: React.ReactNode
	onClick?: () => void
	size?: 'lg' | 'md' | 'sm' | 'xl' | 'xs'
	type?: 'pill' | 'tag'
	variant?: 'active' | 'danger' | 'disabled' | 'info' | 'muted' | 'primary' | 'secondary' | 'success' | 'warning'
}

/**
 * Badge component to display a badge with various styles and options.
 * @deprecated Use the Tag component instead.
 */
export default function Badge({
	children,
	className,
	disabled = false,
	filled = false,
	fullWidth = false,
	icon,
	onClick,
	size = 'md',
	type = 'tag',
	variant = 'primary',
	...props
}: BadgeProps) {
	//

	const badgeClass = cn(
		styles.badge,
		!disabled && {
			[styles.active]: variant === 'active',
			[styles.danger]: variant === 'danger',
			[styles.info]: variant === 'info',
			[styles.muted]: variant === 'muted',
			[styles.primary]: variant === 'primary',
			[styles.secondary]: variant === 'secondary',
			[styles.success]: variant === 'success',
			[styles.warning]: variant === 'warning',
		},
		disabled && styles.disabled,
		type === 'pill' && styles.pill,
		type === 'tag' && styles.tag,
		fullWidth && styles.fullWidth,
		styles[`font${size}`],
		className,
	);

	if (onClick) {
		return (
			<button className={styles.button} onClick={!disabled ? onClick : undefined} type="button">
				<MantineBadge className={badgeClass} data-active={filled} leftSection={icon} {...props} style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
					{children}
				</MantineBadge>
			</button>
		);
	}

	return (
		<MantineBadge className={badgeClass} data-active={filled} leftSection={icon} {...props}>
			{children}
		</MantineBadge>
	);

	//
}
