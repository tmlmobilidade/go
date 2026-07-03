/* * */

import { type JSX } from 'react';

import { type SidebarNavigationNode, sidebarNavigationTree } from './sidebar-navigation-tree';

/* * */

function firstLeafIconFromNodes(nodes: readonly SidebarNavigationNode[]): JSX.Element | undefined {
	for (const n of nodes) {
		if (n.type === 'item') return n.icon;
		const nested = firstLeafIconFromNodes(n.children);
		if (nested) return nested;
	}

	return;
}

function leafIconByIdFromNodes(nodes: readonly SidebarNavigationNode[], id: string): JSX.Element | undefined {
	for (const n of nodes) {
		if (n._id === id) {
			return n.type === 'item' ? n.icon : firstLeafIconFromNodes(n.children);
		}

		if (n.type === 'group') {
			const nested = leafIconByIdFromNodes(n.children, id);
			if (nested) return nested;
		}
	}

	return;
}

export function getSidebarNotificationScopeIcon(scope: string): JSX.Element | undefined {
	return leafIconByIdFromNodes(sidebarNavigationTree, scope);
}
