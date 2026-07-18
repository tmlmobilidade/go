'use client';

import styles from './styles.module.css';

import { useMeContext } from '../../../contexts/Me.context';
import { useCurrentUrl } from '../../../hooks/use-current-url';
import { sidebarNavigationTree } from '../sidebar-navigation-tree';
import { useSidebarContext } from '../Sidebar.context';
import { SidebarOpenGroupsProvider } from '../SidebarOpenGroups.context';
import { SidebarTreeNode } from '../SidebarTreeNode';

/* * */

export function SidebarNavigation() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const currentUrl = useCurrentUrl();
	const sidebarContext = useSidebarContext();

	//
	// B. Render components

	return (
		<SidebarOpenGroupsProvider defaultOpenGroupIds={sidebarContext.data.default_open_group_ids}>
			<div className={styles.container}>
				{sidebarNavigationTree.map(node => (
					<SidebarTreeNode
						key={node._id}
						depth={0}
						node={node}
						pathname={currentUrl?.pathname}
						userPermissions={meContext.data.user?.permissions}
					/>
				))}
			</div>
		</SidebarOpenGroupsProvider>
	);
}
