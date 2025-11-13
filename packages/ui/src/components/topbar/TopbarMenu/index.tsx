'use client';

/* * */

import { ActionIcon, Menu } from '@mantine/core';
import { createElement, type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

interface TopbarMenuProps {
	counter?: number
	icon: React.ElementType
	width?: number | string
}

/* * */

export function TopbarMenu({ children, counter, icon, width }: PropsWithChildren<TopbarMenuProps>) {
	//

	//
	// A. Setup variables

	const counterText = counter ? (counter > 99 ? '99+' : counter.toString()) : undefined;

	//
	// B. Render components

	return (
		<Menu offset={0} position="bottom-end" shadow="lg" width={width} withArrow>
			<Menu.Target>
				<ActionIcon
					className={styles.target}
					color={counter ? 'var(--color-status-danger-primary)' : 'var(--color-system-text-200)'}
					variant="subtle"
				>
					{createElement(icon, { size: 24 })}
					{counterText && <div className={styles.counter}>{counterText}</div>}
				</ActionIcon>
			</Menu.Target>
			<Menu.Dropdown>
				{children}
			</Menu.Dropdown>
		</Menu>
	);
}
