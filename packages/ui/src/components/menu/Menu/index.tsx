'use client';

/* * */

import { ActionIcon, Menu as MantineMenu, type MenuProps as MantineMenuProps } from '@mantine/core';
import { createElement, type PropsWithChildren } from 'react';

import styles from './styles.module.css';

import { Tooltip } from '../../common/Tooltip';

/* * */

interface MenuProps {
	counter?: number
	icon: React.ElementType
	label?: string
	menuPosition?: MantineMenuProps['position']
	variant?: 'danger' | 'neutral' | 'primary'
	width?: number | string
}

/* * */

export function Menu({ children, counter, icon, label, menuPosition = 'bottom-end', variant = 'neutral', width }: PropsWithChildren<MenuProps>) {
	//

	//
	// A. Setup variables

	const counterText = counter ? (counter > 99 ? '99+' : counter.toString()) : undefined;

	let iconColor = 'var(--color-system-text-200)'; // default neutral
	if (counter !== undefined && counter > 0 && variant === 'danger') {
		iconColor = 'var(--color-status-danger-primary)';
	} else if (variant === 'primary') {
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
			{counterText && <div className={`${styles.counter} ${styles[variant]}`}>{counterText}</div>}
		</ActionIcon>
	);

	return (
		<MantineMenu offset={0} position={menuPosition} shadow="lg" width={width} withArrow>
			<MantineMenu.Target>
				{label ? (
					<Tooltip label={label} position="bottom" withArrow>
						{actionButton}
					</Tooltip>
				) : (
					actionButton
				)}
			</MantineMenu.Target>
			<MantineMenu.Dropdown>
				{children}
			</MantineMenu.Dropdown>
		</MantineMenu>
	);
}
