/* * */

import { type JSX } from 'react';

import { sidebarNavigationGroups, type SidebarNavigationGroupType } from '../sidebar-navigation';

/* * */

function firstLeafIconFromNodes(nodes: readonly SidebarNavigationGroupType[]): JSX.Element | undefined {
	for (const n of nodes) {
		if (n.items.length) return n.items[0].icon;
	}

	return;
}

function leafIconByIdFromNodes(nodes: readonly SidebarNavigationGroupType[], id: string): JSX.Element | undefined {
	for (const n of nodes) {
		if (n._id === id) {
			return n.items.length ? n.items[0].icon : firstLeafIconFromNodes([n]);
		}

		if (n.items.length) {
			const nested = leafIconByIdFromNodes([n], id);
			if (nested) return nested;
		}
	}

	return;
}

export function getSidebarNotificationScopeIcon(scope: string): JSX.Element | undefined {
	return leafIconByIdFromNodes(sidebarNavigationGroups, scope);
}
