'use client';

import { PermissionCatalog } from '@tmlmobilidade/types';
import Link from 'next/link';
import { useMemo } from 'react';

import styles from './styles.module.css';

import { useMeContext } from '../../../contexts/Me.context';
import { useCurrentUrl } from '../../../hooks/use-current-url';
import { type SidebarLeafItemConfig } from '../sidebar-navigation.config';
import { useSidebarMode } from '../SidebarMode.context';

/* * */

export interface SidebarItemProps extends SidebarLeafItemConfig {
	depth?: number
	label: string
}

/* * */

export function SidebarItem({ depth = 0, href, icon, label, permissions }: SidebarItemProps) {
	//

	//
	// A. Setup Variables

	const meContext = useMeContext();
	const { iconOnly } = useSidebarMode();

	const currentUrl = useCurrentUrl();

	//
	// B. Transform data

	const isEnabled = useMemo(() => {
		// Allow if no permissions are required
		if (!permissions.length) return true;
		// Skip if user has no permissions
		if (!meContext.data.user?.permissions) return false;
		// Check if the user has at least one of the required permissions
		return permissions.some(permissionObject => PermissionCatalog.hasPermission(meContext.data.user?.permissions, permissionObject.scope, permissionObject.action));
	}, [meContext.data.user?.permissions, permissions]);

	const isActive = useMemo(() => {
		// Skip if window is not defined
		if (typeof window === 'undefined') return false;
		// Skip if is disabled
		if (!isEnabled) return false;
		// Skip if no current URL
		if (!currentUrl) return false;
		// Prepare the item pathname for comparison.
		// In development, the href value is a full URL,
		// while in production it's a pathname.
		let itemPathname: string;
		if (URL.canParse(href)) itemPathname = new URL(href).pathname;
		else itemPathname = href;
		// The current item is active if the
		// current URL pathname starts with the item pathname
		if (currentUrl.pathname.startsWith(itemPathname)) return true;
		return false;
	}, [href, isEnabled, currentUrl]);

	const hrefValue = useMemo(() => {
		// Skip if item is disabled
		if (!isEnabled) return;
		// Skip if item is active
		if (isActive) return;
		// Return the href value
		return href;
	}, [isEnabled, isActive, href]);

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
			data-collapsed={iconOnly}
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
