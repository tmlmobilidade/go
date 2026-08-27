'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { type SidebarNavigationGroupItemType } from '../sidebar-navigation';
import { useSidebarContext } from '../Sidebar.context';

/* * */

export interface SidebarNavigationGroupItemProps {
	isActive: boolean
	item: SidebarNavigationGroupItemType
}

/* * */

export function SidebarNavigationGroupItem({ isActive, item }: SidebarNavigationGroupItemProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const sidebarContext = useSidebarContext();

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
