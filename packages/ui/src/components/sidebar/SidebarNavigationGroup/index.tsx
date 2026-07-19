'use client';

/* * */

import { IconChevronLeft } from '@tabler/icons-react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useCurrentUrl } from '../../../hooks/use-current-url';
import { type SidebarNavigationGroupType } from '../sidebar-navigation';
import { useSidebarContext } from '../Sidebar.context';
import { SidebarNavigationGroupItem } from '../SidebarNavigationGroupItem';
import { isItemActive } from '../utils';

/* * */

export interface SidebarNavigationGroupProps {
	group: SidebarNavigationGroupType
}

/* * */

export function SidebarNavigationGroup({ group }: SidebarNavigationGroupProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const currentUrl = useCurrentUrl();
	const sidebarContext = useSidebarContext();

	//
	// B. Transform data

	const isGroupActive = useMemo(() => {
		return group.items.some(item => isItemActive(item.href, currentUrl?.pathname));
	}, [group, currentUrl?.pathname]);

	const isGroupOpen = useMemo(() => {
		if (isGroupActive) return true;
		return sidebarContext.navigation.open_group_ids.includes(group._id);
	}, [group._id, isGroupActive, sidebarContext.navigation.open_group_ids]);

	//
	// C. Handle actions

	const toggleGroup = useCallback(() => {
		if (isGroupActive) return;
		sidebarContext.navigation.toggleOpenGroup(group._id);
	}, [group._id, isGroupActive, sidebarContext.navigation]);

	//
	// D. Render components

	return (
		<section
			className={styles.container}
			data-group-active={isGroupActive}
			data-group-open={isGroupOpen}
			data-sidebar-collapsed={sidebarContext.presentation.visual_mode === 'collapsed'}
		>

			<div className={styles.header} onClick={toggleGroup}>
				<span aria-hidden="true" className={styles.rule} />
				<span className={styles.label}>{t(`shared:components.sidebar.SidebarGroups.${group._id}`)}</span>
				<IconChevronLeft className={styles.chevron} stroke={3} />
			</div>

			{isGroupOpen && (
				<div className={styles.items}>
					{group.items.map(item => (
						<SidebarNavigationGroupItem key={item._id} item={item} />
					))}
				</div>
			)}

		</section>
	);
}
