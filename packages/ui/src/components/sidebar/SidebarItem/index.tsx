'use client';

import { PermissionCatalog } from '@tmlmobilidade/types';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useMeContext } from '../../../contexts/Me.context';
import { useCurrentUrl } from '../../../hooks/use-current-url';
import { sidebarApps } from '../Sidebar';
import { SidebarItemTooltip } from '../SidebarItemTooltip';

/* * */

export type SidebarItemProps = typeof sidebarApps[number];

/* * */

export function SidebarItem({ _id, href, icon, permissions }: SidebarItemProps) {
	//

	//
	// A. Setup Variables

	const { t } = useTranslation();

	const meContext = useMeContext();

	const currentUrl = useCurrentUrl();

	const ref = useRef<HTMLAnchorElement>(null);

	const [hover, setHover] = useState(false);

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
					label={t(`shared:components.sidebar.Sidebar.${_id}`)}
					target={ref.current}
				/>
			)}
		</>
	);

	//
}
