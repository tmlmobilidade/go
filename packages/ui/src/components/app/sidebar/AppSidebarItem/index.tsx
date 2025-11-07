'use client';

/* * */

import { AppSidebarItemTooltip } from '@/components/app/sidebar/AppSidebarItemTooltip';
import { useMeContext } from '@/contexts/Me.context';
import { useCurrentUrl } from '@/hooks';
import { type Permission } from '@tmlmobilidade/types';
import { hasPermission } from '@tmlmobilidade/utils';
import { useMemo, useRef, useState } from 'react';

import styles from './styles.module.css';

/* * */

export interface AppSidebarItemProps {
	href: string
	icon: React.ReactNode
	label: string
	permissions: Permission<unknown>[]
}

/* * */

export function AppSidebarItem({ href, icon, label, permissions }: AppSidebarItemProps) {
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
		// Skip if user has no permissions
		if (!meContext.data.user?.permissions) return false;
		// For all possible permissions...
		for (const permissionObject of permissions) {
			// ... check if the user is allowed to see this item
			return hasPermission(meContext.data.user?.permissions, permissionObject.scope, permissionObject.action);
		}
		// If no permissions matched
		return false;
	}, [meContext.data.user?.permissions, permissions]);

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
			<a
				ref={ref}
				className={styles.icon}
				data-active={isActive}
				data-disabled={!isEnabled}
				href={hrefValue}
				onMouseEnter={() => setHover(true)}
				onMouseLeave={() => setHover(false)}
			>
				{icon}
			</a>
			{hover && (
				<AppSidebarItemTooltip
					label={label}
					target={ref.current}
				/>
			)}
		</>
	);

	//
}
