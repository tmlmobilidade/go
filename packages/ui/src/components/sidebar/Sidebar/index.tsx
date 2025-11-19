'use client';

/* * */

import { IconAlertTriangle, IconBuildings, IconBusStop, IconClockExclamation, IconFileCertificate, IconFileCheck, IconHome, IconKey, IconListCheck, IconRocket, IconSitemap, IconUser } from '@tabler/icons-react';
import { PAGE_ROUTES, Permissions } from '@tmlmobilidade/consts';

import styles from './styles.module.css';

import { SidebarItem } from '../SidebarItem';

/* * */

export const sidebarApps = [
	{
		_id: 'home',
		href: PAGE_ROUTES.auth.HOME_LIST,
		icon: <IconHome size={26} />,
		label: 'Home',
		permissions: [
			{ action: Permissions.home.actions.read_links, scope: Permissions.home.scope },
			{ action: Permissions.home.actions.read_wiki, scope: Permissions.home.scope },
		],
	},
	{
		_id: 'users',
		href: PAGE_ROUTES.auth.USERS_LIST,
		icon: <IconUser size={26} />,
		label: 'Utilizadores',
		permissions: [{ action: Permissions.users.actions.read, scope: Permissions.users.scope }],
	},
	{
		_id: 'roles',
		href: PAGE_ROUTES.auth.ROLES_LIST,
		icon: <IconKey size={26} />,
		label: 'Grupos de Permissões',
		permissions: [{ action: Permissions.roles.actions.read, scope: Permissions.roles.scope }],
	},
	{
		_id: 'agencies',
		href: PAGE_ROUTES.auth.AGENCIES_LIST,
		icon: <IconBuildings size={26} />,
		label: 'Operadores',
		permissions: [{ action: Permissions.agencies.actions.read, scope: Permissions.agencies.scope }],
	},
	{
		_id: 'organizations',
		href: PAGE_ROUTES.auth.ORGANIZATIONS_LIST,
		icon: <IconSitemap size={26} />,
		label: 'Organizações',
		permissions: [{ action: Permissions.organizations.actions.read, scope: Permissions.organizations.scope }],
	},
	{
		_id: 'alerts',
		href: PAGE_ROUTES.alerts.SCHEDULED_LIST,
		icon: <IconAlertTriangle size={26} />,
		label: 'Alertas',
		permissions: [{ action: Permissions.alerts.actions.read, scope: Permissions.alerts.scope }],
	},
	{
		_id: 'alerts_realtime',
		href: PAGE_ROUTES.alerts.REALTIME_LIST,
		icon: <IconClockExclamation size={26} />,
		label: 'Alertas - Tempo Real',
		permissions: [{ action: Permissions.alerts_realtime.actions.read, scope: Permissions.alerts_realtime.scope }],
	},
	{
		_id: 'rides',
		href: PAGE_ROUTES.controller.RIDES_LIST,
		icon: <IconListCheck size={26} />,
		label: 'Circulações',
		permissions: [{ action: Permissions.rides.actions.analysis_read, scope: Permissions.rides.scope }],
	},
	// {
	// 	_id: 'sams',
	// 	href: PAGE_ROUTES.controller.SAMS_LIST,
	// 	icon: <IconDeviceSim size={26} />,
	// 	label: 'SAMS',
	// 	permissions: [{ action: Permissions.rides.actions.read, scope: Permissions.rides.scope }],
	// },
	{
		_id: 'stops',
		href: PAGE_ROUTES.stops.STOPS_LIST,
		icon: <IconBusStop size={26} />,
		label: 'Paragens',
		permissions: [{ action: Permissions.stops.actions.read, scope: Permissions.stops.scope }],
	},
	{
		_id: 'plans',
		href: PAGE_ROUTES.plans.APPROVED_LIST,
		icon: <IconFileCertificate size={26} />,
		label: 'Planos',
		permissions: [{ action: Permissions.plans.actions.read, scope: Permissions.plans.scope }],
	},
	{
		_id: 'validations',
		href: PAGE_ROUTES.plans.VALIDATIONS_LIST,
		icon: <IconFileCheck size={26} />,
		label: 'Validações GTFS',
		permissions: [{ action: Permissions.validations.actions.read, scope: Permissions.validations.scope }],
	},
	{
		_id: 'performance',
		href: PAGE_ROUTES.performance.BASE,
		icon: <IconRocket size={26} />,
		label: 'Performance',
		permissions: [{ action: Permissions.performance.actions.read, scope: Permissions.performance.scope }],
	},
];

/* * */

export function Sidebar() {
	return (
		<div className={styles.sidebar}>
			<div className={styles.navWrapper}>
				{sidebarApps.map(item => (
					<SidebarItem
						key={item.href}
						href={item.href}
						icon={item.icon}
						label={item.label}
						permissions={item.permissions}
					/>
				))}
			</div>
		</div>
	);
}
