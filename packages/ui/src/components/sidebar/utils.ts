/* * */

import { type Permission, PermissionCatalog } from '@tmlmobilidade/types';

import { type SidebarNavigationGroup, sidebarNavigationGroups } from './sidebar-navigation';

/* * */

export function getItemPathname(href: string) {
	if (URL.canParse(href)) return new URL(href).pathname;

	const hrefWithoutQuery = href.split('?')[0];
	const hrefWithoutHash = hrefWithoutQuery.split('#')[0];
	return hrefWithoutHash;
}

export function normalizePathname(pathname: string) {
	if (pathname === '/') return '/';
	const normalized = pathname.replace(/\/+$/, '');
	return normalized.length ? normalized : '/';
}

export function isPermissionEnabled(permissions: readonly Permission[], userPermissions?: readonly Permission[]) {
	if (!permissions.length) return true;
	if (!userPermissions) return false;
	return permissions.some(permissionObject => PermissionCatalog.hasPermission([...userPermissions], permissionObject.scope, permissionObject.action));
}

export function isItemActive(href: string, currentPathname?: string) {
	if (!currentPathname) return false;
	const itemPathname = normalizePathname(getItemPathname(href));
	const current = normalizePathname(currentPathname);
	if (itemPathname === '/') return current === '/';
	return current === itemPathname || current.startsWith(`${itemPathname}/`);
}

export function isGroupVisible(group: SidebarNavigationGroup, userPermissions?: readonly Permission[]) {
	return group.items.some(item => isPermissionEnabled(item.permissions, userPermissions));
}

export function isGroupActive(group: SidebarNavigationGroup, pathname?: string) {
	return group.items.some(item => isItemActive(item.href, pathname));
}

export function getDefaultOpenGroupIds(pathname?: string): string[] {
	return sidebarNavigationGroups
		.filter(group => isGroupActive(group, pathname))
		.map(node => node._id);
}
