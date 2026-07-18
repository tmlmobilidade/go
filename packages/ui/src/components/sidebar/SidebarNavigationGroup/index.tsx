'use client';

/* * */

import { Collapse } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { type Permission } from '@tmlmobilidade/types';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { type SidebarNavigationGroup } from '../sidebar-navigation';
import { useSidebarContext } from '../Sidebar.context';
import { SidebarNavigationGroupItem } from '../SidebarNavigationGroupItem';
import { isItemActive } from '../utils';

/* * */

export interface SidebarNavigationGroupProps {
	group: SidebarNavigationGroup
	pathname?: string
	userPermissions?: readonly Permission[]
}

/* * */

export function SidebarNavigationGroup({ group, pathname, userPermissions }: SidebarNavigationGroupProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const sidebarContext = useSidebarContext();

	//
	// B. Transform data

	const isGroupActive = useMemo(() => {
		return group.items.some(item => isItemActive(item.href, pathname));
	}, [group, pathname]);

	const isGroupOpen = useMemo(() => {
		if (isGroupActive) return true;
		return sidebarContext.data.open_group_ids.includes(group._id);
	}, [group._id, isGroupActive, sidebarContext.data.open_group_ids]);

	//
	// C. Handle actions

	const toggleGroup = useCallback(() => {
		// sidebarContext.presentation.toggleGroup(group._id);
	}, []);

	//
	// C. Render components

	// if (node.type === 'item') {
	// 	if (!isPermissionEnabled(node.permissions, userPermissions)) {
	// 		return null;
	// 	}

	// 	const itemLabel = t(`shared:components.sidebar.Sidebar.${node._id}` as never);

	// 	return (
	// 		<SidebarNavigationGroupItem
	// 			label={itemLabel}
	// 			pathname={pathname}
	// 			userPermissions={userPermissions}
	// 			{...node}
	// 		/>
	// 	);
	// }

	// if (node.permissions && !isPermissionEnabled(node.permissions, userPermissions)) {
	// 	return null;
	// }

	// const groupLabel = t(`shared:components.sidebar.SidebarGroups.${node._id}` as never);
	// const visibleChildren = node.children.filter(child => isNodeVisible(child, userPermissions));

	// if (!visibleChildren.length) {
	// 	return null;
	// }

	return (
		<section className={styles.group}>

			<button
				aria-label={t(`shared:components.sidebar.SidebarGroups.${group._id}` as never)}
				className={styles.groupHeader}
				data-collapsed={true}
				onClick={toggleGroup}
				type="button"
			>
				<span aria-hidden="true" className={styles.groupRule} />
				<span className={styles.groupLabel}>{t(`shared:components.sidebar.SidebarGroups.${group._id}` as never)}</span>
				<IconChevronDown className={styles.groupChevron} data-open={isGroupOpen} size={14} />
			</button>

			<Collapse expanded={isGroupOpen} transitionDuration={0}>
				<div className={styles.groupChildren} data-sidebar-group-children>
					{group.items.map(item => (
						<SidebarNavigationGroupItem
							key={item._id}
							_id={item._id}
							href={item.href}
							icon={item.icon}
							label={t(`shared:components.sidebar.Sidebar.${item._id}`)}
							pathname={pathname}
							permissions={item.permissions}
							userPermissions={userPermissions}
						/>
					))}
				</div>
			</Collapse>

		</section>
	);
}
