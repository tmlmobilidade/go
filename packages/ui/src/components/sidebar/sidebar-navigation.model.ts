/* * */

import { type Permission, PermissionCatalog } from '@tmlmobilidade/types';

import { sidebarApps, type SidebarGroupItemConfig, type SidebarNodeConfig } from './sidebar-navigation.config';

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

export function isNodeVisible(node: SidebarNodeConfig, userPermissions?: readonly Permission[]) {
	if (node.type === 'item') {
		return isPermissionEnabled(node.permissions, userPermissions);
	}

	if (node.permissions && !isPermissionEnabled(node.permissions, userPermissions)) {
		return false;
	}

	return node.children.some(child => isNodeVisible(child, userPermissions));
}

export function isNodeActive(node: SidebarNodeConfig, pathname?: string) {
	if (node.type === 'item') {
		return isItemActive(node.href, pathname);
	}

	return node.children.some(child => isNodeActive(child, pathname));
}

export function getDefaultOpenGroupIds(pathname?: string): string[] {
	return sidebarApps
		.filter((node): node is SidebarGroupItemConfig => node.type === 'group' && isNodeActive(node, pathname))
		.map(node => node._id);
}
