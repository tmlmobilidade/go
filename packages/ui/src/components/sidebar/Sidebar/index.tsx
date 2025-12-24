'use client';

/* * */

import { IconAlertTriangle, IconBuildings, IconBusStop, IconClockExclamation, IconFileCertificate, IconFileCheck, IconHome, IconKey, IconListCheck, IconNote, IconRocket, IconSitemap, IconUser } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Permission, PermissionCatalog } from '@tmlmobilidade/types';
import { type JSX } from 'react';

import styles from './styles.module.css';

import { SidebarItem } from '../SidebarItem';

/* * */

interface SidebarAppItemConfig {
	_id: string
	href: string
	icon: JSX.Element
	label: string
	permissions: Permission[]
}

export const sidebarApps: SidebarAppItemConfig[] = [
	{
		_id: 'home',
		href: PAGE_ROUTES.auth.HOME_LIST,
		icon: <IconHome size={26} />,
		label: 'Home',
		permissions: [
			{ action: PermissionCatalog.all.home.actions.read_links, scope: PermissionCatalog.all.home.scope },
			{ action: PermissionCatalog.all.home.actions.read_wiki, scope: PermissionCatalog.all.home.scope },
		],
	},
	{
		_id: 'users',
		href: PAGE_ROUTES.auth.USERS_LIST,
		icon: <IconUser size={26} />,
		label: 'Utilizadores',
		permissions: [{ action: PermissionCatalog.all.users.actions.read, scope: PermissionCatalog.all.users.scope }],
	},
	{
		_id: 'roles',
		href: PAGE_ROUTES.auth.ROLES_LIST,
		icon: <IconKey size={26} />,
		label: 'Grupos de Permissões',
		permissions: [{ action: PermissionCatalog.all.roles.actions.read, scope: PermissionCatalog.all.roles.scope }],
	},
	{
		_id: 'agencies',
		href: PAGE_ROUTES.auth.AGENCIES_LIST,
		icon: <IconBuildings size={26} />,
		label: 'Operadores',
		permissions: [{ action: PermissionCatalog.all.agencies.actions.read, scope: PermissionCatalog.all.agencies.scope }],
	},
	{
		_id: 'organizations',
		href: PAGE_ROUTES.auth.ORGANIZATIONS_LIST,
		icon: <IconSitemap size={26} />,
		label: 'Organizações',
		permissions: [{ action: PermissionCatalog.all.organizations.actions.read, scope: PermissionCatalog.all.organizations.scope }],
	},
	{
		_id: 'alerts',
		href: PAGE_ROUTES.alerts.SCHEDULED_LIST,
		icon: <IconAlertTriangle size={26} />,
		label: 'Alertas Planeados',
		permissions: [{ action: PermissionCatalog.all.alerts.actions.read_scheduled, resources: { agency_ids: [] }, scope: PermissionCatalog.all.alerts.scope }],
	},
	{
		_id: 'alerts_realtime',
		href: PAGE_ROUTES.alerts.REALTIME_LIST,
		icon: <IconClockExclamation size={26} />,
		label: 'Alertas em Tempo Real',
		permissions: [{ action: PermissionCatalog.all.alerts.actions.read_realtime, resources: { agency_ids: [] }, scope: PermissionCatalog.all.alerts.scope }],
	},
	{
		_id: 'rides',
		href: PAGE_ROUTES.controller.RIDES_LIST,
		icon: <IconListCheck size={26} />,
		label: 'Circulações',
		permissions: [{ action: PermissionCatalog.all.rides.actions.analysis_read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.rides.scope }],
	},
	// {
	// 	_id: 'sams',
	// 	href: PAGE_ROUTES.controller.SAMS_LIST,
	// 	icon: <IconDeviceSim size={26} />,
	// 	label: 'SAMS',
	// 	permissions: [{ action: PermissionCatalog.all.rides.actions.read, scope: PermissionCatalog.all.rides.scope }],
	// },
	{
		_id: 'stops',
		href: PAGE_ROUTES.stops.STOPS_LIST,
		icon: <IconBusStop size={26} />,
		label: 'Paragens',
		permissions: [{ action: PermissionCatalog.all.stops.actions.read, resources: { agency_ids: [], municipality_ids: [] }, scope: PermissionCatalog.all.stops.scope }],
	},
	{
		_id: 'plans',
		href: PAGE_ROUTES.plans.APPROVED_LIST,
		icon: <IconFileCertificate size={26} />,
		label: 'Planos',
		permissions: [{ action: PermissionCatalog.all.plans.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.plans.scope }],
	},
	{
		_id: 'validations',
		href: PAGE_ROUTES.plans.VALIDATIONS_LIST,
		icon: <IconFileCheck size={26} />,
		label: 'Validações GTFS',
		permissions: [{ action: PermissionCatalog.all.gtfs_validations.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.gtfs_validations.scope }],
	},
	{
		_id: 'performance',
		href: PAGE_ROUTES.performance.BASE,
		icon: <IconRocket size={26} />,
		label: 'Performance',
		permissions: [{ action: PermissionCatalog.all.performance.actions.read, scope: PermissionCatalog.all.performance.scope }],
	},
	{
		_id: 'annotations',
		href: PAGE_ROUTES.dates.ANNOTATIONS_LIST,
		icon: <IconNote size={26} />,
		label: 'Anotações',
		permissions: [{ action: PermissionCatalog.all.dates.actions.read_annotations, resources: { agency_ids: [] }, scope: PermissionCatalog.all.dates.scope }],
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
						requiredPermissions={item.permissions}
					/>
				))}
			</div>
		</div>
	);
}
