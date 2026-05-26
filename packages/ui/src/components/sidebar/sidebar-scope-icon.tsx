/* * */

import { type JSX } from 'react';

import { sidebarApps, type SidebarNodeConfig } from './sidebar-navigation.config';

/* * */

function firstLeafIconFromNodes(nodes: readonly SidebarNodeConfig[]): JSX.Element | undefined {
	for (const n of nodes) {
		if (n.type === 'item') return n.icon;
		const nested = firstLeafIconFromNodes(n.children);
		if (nested) return nested;
	}

	return;
}

function leafIconByIdFromNodes(nodes: readonly SidebarNodeConfig[], id: string): JSX.Element | undefined {
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

/** Icon for notifications / summaries.
 * If `scope` matches a leaf `_id`, return its icon.
 * If `scope` matches a group `_id`, return the first leaf icon under that group.
 */
export function getSidebarScopeRepresentativeIcon(scope: string): JSX.Element | undefined {
	return leafIconByIdFromNodes(sidebarApps, scope);
}
