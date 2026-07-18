'use client';

import styles from './styles.module.css';

import { sidebarNavigationGroups } from '../sidebar-navigation';
import { SidebarNavigationGroup } from '../SidebarNavigationGroup';

/* * */

export function SidebarNavigation() {
	return (
		<div className={styles.container}>
			{sidebarNavigationGroups.map(group => (
				<SidebarNavigationGroup key={group._id} group={group} />
			))}
		</div>
	);
}
