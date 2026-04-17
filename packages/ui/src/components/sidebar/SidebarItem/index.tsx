'use client';

/* * */

import { type Permission, PermissionCatalog } from '@tmlmobilidade/types';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';

import styles from './styles.module.css';

import { useMeContext } from '../../../contexts';
import { useCurrentUrl } from '../../../hooks';
import { SidebarItemTooltip } from '../SidebarItemTooltip';

/* * */

export interface SidebarItemProps {
	href: string
	icon: React.ReactNode
	label: string
	requiredPermissions: Permission[]
}

/* * */

export function SidebarItem({ href, icon, label, requiredPermissions }: SidebarItemProps) {
	//

	//
	// A. Setup Variables

	const meContext = useMeContext();

	const currentUrl = useCurrentUrl();

	const ref = useRef<HTMLAnchorElement>(null);

	const [hover, setHover] = useState(false);

	//
	// B. Transform data

	const isEnabled = useMemo(() => {
		// Item with no required permissions is public.
		if (requiredPermissions.length === 0) return true;
		// Skip if user has no permissions
		if (!meContext.data.user?.permissions) return false;
		// For all possible permissions...
		for (const permissionObject of requiredPermissions) {
			// ... check if the user is allowed to see this item
			return PermissionCatalog.hasPermission(meContext.data.user?.permissions, permissionObject.scope, permissionObject.action);
		}
		// If no permissions matched
		return false;
	}, [meContext.data.user?.permissions, requiredPermissions]);

	const isActive = useMemo(() => {
		// Skip if window is not defined
		if (typeof window === 'undefined') return false;
		// Skip if is disabled
		if (!isEnabled) return false;
		// The current item is active if the
		// current URL starts with the item href
		if (currentUrl?.startsWith(href)) return true;
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
		<>
			<Link
				ref={ref}
				className={styles.icon}
				data-active={isActive}
				data-disabled={!isEnabled}
				href={hrefValue ?? '#'}
				onMouseEnter={() => setHover(true)}
				onMouseLeave={() => setHover(false)}
			>
				{icon}
			</Link>
			{hover && (
				<SidebarItemTooltip
					label={label}
					target={ref.current}
				/>
			)}
		</>
	);

	//
}
