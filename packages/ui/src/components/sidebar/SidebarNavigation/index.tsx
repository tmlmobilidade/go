'use client';

import { PermissionCatalog } from '@tmlmobilidade/types';
import { useMemo } from 'react';

import styles from './styles.module.css';

import { useMeContext } from '../../../contexts/Me.context';
import { sidebarNavigationGroups, type SidebarNavigationGroupType } from '../sidebar-navigation';
import { useSidebarContext } from '../Sidebar.context';
import { SidebarNavigationGroup } from '../SidebarNavigationGroup';

/* * */

export function SidebarNavigation() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const sidebarContext = useSidebarContext();

	//
	// B. Transform data

	const enabledNavigationGroups: SidebarNavigationGroupType[] = useMemo(() => {
		// Return empty array if user has no permissions
		if (!meContext.data.user?.permissions) return [];
		// Filter groups to only include those with enabled items
		return sidebarNavigationGroups
			.map(group => ({
				...group,
				items: group.items.filter((item) => {
					// Return true if item needs no permissions
					if (!item.permissions.length) return true;
					// Check if the user has the required permissions
					return item.permissions.some((permissionObject) => {
						return PermissionCatalog.hasPermission(meContext.data.user.permissions, permissionObject.scope, permissionObject.action);
					});
				}),
			}))
			.filter((group) => {
				// Filter groups to only include those
				// with at least one enabled item
				return group.items.length;
			});
	}, [meContext.data.user.permissions]);

	//
	// B. Render components

	return (
		<div
			className={styles.container}
			data-expanded={sidebarContext.presentation.visual_mode !== 'collapsed'}
		>
			{enabledNavigationGroups.map(group => (
				<SidebarNavigationGroup key={group._id} group={group} />
			))}
		</div>
	);
}
