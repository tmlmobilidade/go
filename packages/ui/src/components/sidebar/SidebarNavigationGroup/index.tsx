'use client';

/* * */

import { IconChevronLeft } from '@tabler/icons-react';
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
		return sidebarContext.navigation.open_group_ids.includes(group._id);
	}, [group._id, isGroupActive, sidebarContext.navigation.open_group_ids]);

	//
	// C. Handle actions

	const toggleGroup = useCallback(() => {
		sidebarContext.navigation.toggleOpenGroup(group._id);
	}, [group._id, sidebarContext.navigation]);

	//
	// D. Render components

	return (
		<section
			className={styles.container}
			data-group-open={isGroupOpen}
			data-sidebar-collapsed={sidebarContext.presentation.visual_mode === 'collapsed'}
		>

			<div className={styles.header} onClick={toggleGroup}>
				<span aria-hidden="true" className={styles.rule} />
				<span className={styles.label}>{t(`shared:components.sidebar.SidebarGroups.${group._id}`)}</span>
				<IconChevronLeft className={styles.chevron} />
			</div>

			{isGroupOpen && (
				<div className={styles.items}>
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
			)}

		</section>
	);
}
