'use client';

import styles from './styles.module.css';

import { sidebarNavigationGroups } from '../sidebar-navigation';
import { useSidebarContext } from '../Sidebar.context';
import { SidebarNavigationGroup } from '../SidebarNavigationGroup';

/* * */

export function SidebarNavigation() {
	//

	//
	// A. Setup variables

	const sidebarContext = useSidebarContext();

	//
	// B. Render components

	return (
		<div
			className={styles.container}
			data-expanded={sidebarContext.presentation.visual_mode !== 'collapsed'}
		>
			{sidebarNavigationGroups.map(group => (
				<SidebarNavigationGroup key={group._id} group={group} />
			))}
		</div>
	);
}
