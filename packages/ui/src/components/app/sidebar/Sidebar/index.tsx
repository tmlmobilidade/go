'use client';

/* * */

import { SidebarItem } from '@/components/app/sidebar/SidebarItem';
import { IconAlertTriangle, IconBuildings, IconBusStop, IconClockExclamation, IconFileCertificate, IconFileCheck, IconHome, IconKey, IconListCheck, IconRocket, IconSitemap, IconUser } from '@tabler/icons-react';
import { getAppConfig, Permissions } from '@tmlmobilidade/consts';

import styles from './styles.module.css';

/* * */

export const sidebarApps = [
	{
		_id: 'home',
		href: `${getAppConfig('auth', 'frontend_url')}/home`,
		icon: <IconHome size={26} />,
		label: 'Home',
		permissions: [
			{ action: Permissions.home.actions.read_links, scope: Permissions.home.scope },
			{ action: Permissions.home.actions.read_wiki, scope: Permissions.home.scope },
		],
	},
	{
		_id: 'users',
		href: `${getAppConfig('auth', 'frontend_url')}/users`,
		icon: <IconUser size={26} />,
		label: 'Utilizadores',
		permissions: [{ action: Permissions.users.actions.read, scope: Permissions.users.scope }],
	},
	{
		_id: 'roles',
		href: `${getAppConfig('auth', 'frontend_url')}/roles`,
		icon: <IconKey size={26} />,
		label: 'Grupos de Permissões',
		permissions: [{ action: Permissions.roles.actions.read, scope: Permissions.roles.scope }],
	},
	{
		_id: 'agencies',
		href: `${getAppConfig('auth', 'frontend_url')}/agencies`,
		icon: <IconBuildings size={26} />,
		label: 'Operadores',
		permissions: [{ action: Permissions.agencies.actions.read, scope: Permissions.agencies.scope }],
	},
	{
		_id: 'organizations',
		href: `${getAppConfig('auth', 'frontend_url')}/organizations`,
		icon: <IconSitemap size={26} />,
		label: 'Organizações',
		permissions: [{ action: Permissions.organizations.actions.read, scope: Permissions.organizations.scope }],
	},
	{
		_id: 'alerts',
		href: getAppConfig('alerts', 'frontend_url'),
		icon: <IconAlertTriangle size={26} />,
		label: 'Alertas',
		permissions: [{ action: Permissions.alerts.actions.read, scope: Permissions.alerts.scope }],
	},
	{
		_id: 'alerts_realtime',
		href: `${getAppConfig('alerts', 'frontend_url')}/realtime`,
		icon: <IconClockExclamation size={26} />,
		label: 'Alertas - Tempo Real',
		permissions: [{ action: Permissions.alerts_realtime.actions.read, scope: Permissions.alerts_realtime.scope }],
	},
	{
		_id: 'rides',
		href: `${getAppConfig('controller', 'frontend_url')}/rides`,
		icon: <IconListCheck size={26} />,
		label: 'Circulações',
		permissions: [{ action: Permissions.rides.actions.analysis_read, scope: Permissions.rides.scope }],
	},
	// {
	// 	_id: 'sams',
	// 	href: `${getAppConfig('controller', 'frontend_url')}/sams`,
	// 	icon: <IconDeviceSim size={26} />,
	// 	label: 'SAMS',
	// 	permissions: [{ action: Permissions.rides.actions.read, scope: Permissions.rides.scope }],
	// },
	{
		_id: 'stops',
		href: getAppConfig('stops', 'frontend_url'),
		icon: <IconBusStop size={26} />,
		label: 'Paragens',
		permissions: [{ action: Permissions.stops.actions.read, scope: Permissions.stops.scope }],
	},
	{
		_id: 'plans',
		href: `${getAppConfig('plans', 'frontend_url')}/plans`,
		icon: <IconFileCertificate size={26} />,
		label: 'Planos',
		permissions: [{ action: Permissions.plans.actions.read, scope: Permissions.plans.scope }],
	},
	{
		_id: 'validations',
		href: `${getAppConfig('plans', 'frontend_url')}/validations`,
		icon: <IconFileCheck size={26} />,
		label: 'Validações GTFS',
		permissions: [{ action: Permissions.validations.actions.read, scope: Permissions.validations.scope }],
	},
	{
		_id: 'performance',
		href: `${getAppConfig('performance', 'frontend_url')}/performance`,
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
