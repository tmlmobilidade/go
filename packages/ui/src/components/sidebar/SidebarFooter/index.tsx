'use client';

/* * */

import type { MenuProps } from '@mantine/core';

import styles from './styles.module.css';

import { EnvironmentTag } from '../../tags/EnvironmentTag';
import { SidebarExports } from '../SidebarExports';
import { SidebarNotifications } from '../SidebarNotifications';
import { SidebarOptions } from '../SidebarOptions';

/* * */

export interface SidebarFooterProps {
	iconOnly?: boolean
	menuPosition?: MenuProps['position']
}

/* * */

export function SidebarFooter({ iconOnly = false, menuPosition }: SidebarFooterProps) {
	return (
		<div className={styles.footer} data-icon-only={iconOnly}>
			<div className={styles.footerRow}>
				<div className={styles.envSlot}>
					<EnvironmentTag />
				</div>
				<div className={styles.actions}>
					<SidebarExports menuPosition={menuPosition} />
					<SidebarNotifications menuPosition={menuPosition} />
					<SidebarOptions menuPosition={menuPosition} />
				</div>
			</div>
		</div>
	);
}
