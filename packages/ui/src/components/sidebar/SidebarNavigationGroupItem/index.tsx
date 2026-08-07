'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useCurrentUrl } from '../../../hooks/use-current-url';
import { type SidebarNavigationGroupItemType } from '../sidebar-navigation';
import { useSidebarContext } from '../Sidebar.context';
import { isItemActive } from '../utils';

/* * */

export interface SidebarNavigationGroupItemProps {
	item: SidebarNavigationGroupItemType
}

/* * */

export function SidebarNavigationGroupItem({ item }: SidebarNavigationGroupItemProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const currentUrl = useCurrentUrl();

	const sidebarContext = useSidebarContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		return isItemActive(item.href, currentUrl?.pathname);
	}, [currentUrl?.pathname, item.href]);

	//
	// C. Render components

	return (
		<Link
			aria-label={t(`shared:components.sidebar.Sidebar.${item._id}`)}
			className={styles.item}
			data-active={isActive}
			href={isActive ? '#' : item.href ?? '#'}
		>
			<span className={styles.icon}>{item.icon}</span>
			{sidebarContext.presentation.visual_mode !== 'collapsed' && (
				<span className={styles.label}>{t(`shared:components.sidebar.Sidebar.${item._id}`)}</span>
			)}
		</Link>
	);
}
