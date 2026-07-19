'use client';

/* * */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useMeContext } from '../../../contexts/Me.context';
import { useCurrentUrl } from '../../../hooks/use-current-url';
import { type SidebarNavigationGroupItem } from '../sidebar-navigation';
import { useSidebarContext } from '../Sidebar.context';
import { isItemActive, isPermissionEnabled } from '../utils';

/* * */

export interface SidebarNavigationGroupItemProps {
	item: SidebarNavigationGroupItem
}

/* * */

export function SidebarNavigationGroupItem({ item }: SidebarNavigationGroupItemProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const meContext = useMeContext();
	const currentUrl = useCurrentUrl();

	const sidebarContext = useSidebarContext();

	//
	// B. Transform data

	const effectiveUserPermissions = item.permissions ?? meContext.data.user?.permissions;
	const isEnabled = isPermissionEnabled(item.permissions, effectiveUserPermissions);
	const isActive = isEnabled && isItemActive(item.href, currentUrl?.pathname);
	const hrefValue = isActive ? '#' : item.href;

	//
	// C. Render components

	if (!isEnabled) {
		return null;
	}

	return (
		<Link
			aria-label={t(`shared:components.sidebar.Sidebar.${item._id}`)}
			className={styles.item}
			data-active={isActive}
			data-disabled={!isEnabled}
			href={hrefValue ?? '#'}
		>
			<span className={styles.icon}>{item.icon}</span>
			{sidebarContext.presentation.visual_mode !== 'collapsed' && (
				<span className={styles.label}>{t(`shared:components.sidebar.Sidebar.${item._id}`)}</span>
			)}
		</Link>
	);

	//
}
