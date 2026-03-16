'use client';

/* * */

import { ActionIcon, Menu } from '@mantine/core';
import { createElement, type PropsWithChildren } from 'react';

import styles from './styles.module.css';

import { Tooltip } from '../../common/Tooltip';

/* * */

interface TopbarMenuProps {
	counter?: number
	icon: React.ElementType
	label?: string
	variant?: 'danger' | 'neutral' | 'primary'
	width?: number | string
}

/* * */

export function TopbarMenu({ children, counter, icon, label, variant = 'neutral', width }: PropsWithChildren<TopbarMenuProps>) {
	//

	//
	// A. Setup variables

	const counterText = counter ? (counter > 99 ? '99+' : counter.toString()) : undefined;

	let iconColor = 'var(--color-system-text-200)'; // default neutral
	if (counter !== undefined && counter > 0) {
		iconColor = 'var(--color-status-danger-primary)';
	}
	else if (variant === 'primary') {
		iconColor = 'var(--color-primary)';
	}

	//
	// B. Render components

	const actionButton = (
		<ActionIcon
			className={styles.target}
			color={iconColor}
			variant="subtle"
		>
			{createElement(icon, { size: 24 })}
			{counterText && <div className={styles.counter}>{counterText}</div>}
		</ActionIcon>
	);

	return (
		<Menu offset={0} position="bottom-end" shadow="lg" width={width} withArrow>
			<Menu.Target>
				{label ? (
					<Tooltip label={label} position="bottom" withArrow>
						{actionButton}
					</Tooltip>
				) : (
					actionButton
				)}
			</Menu.Target>
			<Menu.Dropdown>
				{children}
			</Menu.Dropdown>
		</Menu>
	);
}
