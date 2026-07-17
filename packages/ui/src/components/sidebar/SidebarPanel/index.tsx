'use client';

import { type Permission } from '@tmlmobilidade/types';

import styles from './styles.module.css';

import { sidebarNavigationTree } from '../sidebar-navigation-tree';
import { SidebarTreeNode } from '../SidebarTreeNode';

/* * */

export interface SidebarPanelProps {
	pathname?: string
	userPermissions?: readonly Permission[]
}

/* * */

export function SidebarPanel({ pathname, userPermissions }: SidebarPanelProps) {
	return (
		<div className={styles.sidebarContent}>
			{sidebarNavigationTree.map(node => (
				<SidebarTreeNode
					key={node._id}
					depth={0}
					node={node}
					pathname={pathname}
					userPermissions={userPermissions}
				/>
			))}
		</div>
	);
}
