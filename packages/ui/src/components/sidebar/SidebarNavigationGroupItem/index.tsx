'use client';

/* * */

import { type Permission } from '@tmlmobilidade/types';
import Link from 'next/link';

import styles from './styles.module.css';

import { useMeContext } from '../../../contexts/Me.context';
import { useCurrentUrl } from '../../../hooks/use-current-url';
import { type SidebarNavigationGroupItem } from '../sidebar-navigation';
import { isItemActive, isPermissionEnabled } from '../utils';

/* * */

export interface SidebarItemProps extends SidebarNavigationGroupItem {
	depth?: number
	label: string
	pathname?: string
	userPermissions?: readonly Permission[]
}

/* * */

export function SidebarNavigationGroupItem({ depth = 0, href, icon, label, pathname, permissions, userPermissions }: SidebarItemProps) {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const currentUrl = useCurrentUrl();

	//
	// B. Transform data

	const effectivePathname = pathname ?? currentUrl?.pathname;
	const effectiveUserPermissions = userPermissions ?? meContext.data.user?.permissions;
	const isEnabled = isPermissionEnabled(permissions, effectiveUserPermissions);
	const isActive = isEnabled && isItemActive(href, effectivePathname);
	const hrefValue = isActive ? '#' : href;

	//
	// C. Render components

	if (!isEnabled) {
		return null;
	}

	return (
		<Link
			aria-label={label}
			className={styles.item}
			data-active={isActive}
			data-collapsed={true}
			data-depth={depth}
			data-disabled={!isEnabled}
			href={hrefValue ?? '#'}
		>
			<span className={styles.icon}>{icon}</span>
			<span className={styles.label}>{label}</span>
		</Link>
	);

	//
}
