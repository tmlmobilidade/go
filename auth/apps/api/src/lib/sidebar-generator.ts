/* * */

import { Permissions } from '@tmlmobilidade/core/lib';
import { Permission, User } from '@tmlmobilidade/core/types';
import { getPermission } from '@tmlmobilidade/core/utils';

/* * */

interface SidebarItem {
	disabled?: boolean
	href: string
	icon: string
	label: string
	permission?: { action: string, scope: string }
}

/* * */

const isDevelopment = process.env.NODE_ENV === 'development';

/* * */

const sidebarItems: SidebarItem[] = [
	{
		disabled: false,
		href: isDevelopment ? 'http://localhost:51001' : 'https://alerts.sae.carrismetropolitana.pt',
		icon: 'IconAlertTriangle',
		label: 'Alertas',
		permission: { action: Permissions.alerts.actions.list, scope: Permissions.alerts.scope },
	},
	{
		disabled: false,
		href: isDevelopment ? 'http://localhost:51002' : 'https://controller.sae.carrismetropolitana.pt',
		icon: 'IconListCheck',
		label: 'Monitorização',
		permission: { action: Permissions.rides.actions.list, scope: Permissions.rides.scope },
	},
	{
		disabled: false,
		href: isDevelopment ? 'http://localhost:51003' : 'https://pulse.sae.carrismetropolitana.pt',
		icon: 'IconChartArrowsVertical',
		label: 'Performance',
		permission: { action: Permissions.rides.actions.list, scope: Permissions.rides.scope },
	},
	{
		disabled: false,
		href: isDevelopment ? 'http://localhost:51004' : 'https://stops.sae.carrismetropolitana.pt',
		icon: 'IconBusStop',
		label: 'Paragens',
		permission: { action: Permissions.stops.actions.list, scope: Permissions.stops.scope },
	},
	{
		disabled: false,
		href: isDevelopment ? 'http://localhost:51005' : 'https://equipments.sae.carrismetropolitana.pt',
		icon: 'IconDeviceGamepad3',
		label: 'Equipamentos',
		permission: { action: Permissions.municipalities.actions.list, scope: Permissions.municipalities.scope },
	},
	{
		disabled: false,
		href: isDevelopment ? 'http://localhost:51000' : 'https://auth.sae.carrismetropolitana.pt',
		icon: 'IconUser',
		label: 'Auth',
		permission: { action: Permissions.users.actions.list, scope: Permissions.users.scope },
	},
];

/**
 * Generates a sidebar for the given user based on their permissions.
 * @param user - The user for whom the sidebar is being generated.
 * @returns An array of sidebar items that the user has permission to access.
 */
export function generateSidebar(user: User) {
	// Filter sidebar items based on user permissions
	const filteredSidebarItems = sidebarItems.filter((item) => {
		const permission = getPermission(user.permissions as unknown as Permission<unknown>[], item.permission.scope, item.permission.action);
		return permission && permission.action === item.permission.action && permission.scope === item.permission.scope;
	});
	// Remove Permissions field
	return filteredSidebarItems.map(item => ({ ...item, permission: undefined }));
}
