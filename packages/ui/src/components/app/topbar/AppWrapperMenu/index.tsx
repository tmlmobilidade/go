'use client';

/* * */

import { ActionIcon, Menu } from '@mantine/core';
import React from 'react';

import styles from './styles.module.css';

/* * */

interface AppWrapperMenuProps {
	children: React.ReactNode
	counter?: number
	icon: React.ElementType
	withArrow?: boolean
}

export function AppWrapperMenu({ children, counter, icon, withArrow }: AppWrapperMenuProps) {
	//

	//
	// A. Setup variables

	const hasCounter = counter !== undefined && counter > 0;
	const counterText = hasCounter && counter > 99 ? '99+' : counter?.toString();

	//
	// B. Render components

	return (
		<Menu offset={0} position="bottom-end" shadow="lg" width="40%" withArrow={withArrow}>
			<Menu.Target>
				<ActionIcon
					className={styles.target}
					color={hasCounter ? 'var(--color-status-danger-primary)' : 'var(--color-system-text-200)'}
					variant="subtle"
				>
					{React.createElement(icon, { size: 24 })}
					{hasCounter && (
						<div className={styles.counter}>{counterText}</div>
					)}
				</ActionIcon>
			</Menu.Target>
			<Menu.Dropdown>
				{children}
			</Menu.Dropdown>
		</Menu>
	);
}
