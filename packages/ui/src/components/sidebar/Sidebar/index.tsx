'use client';

/* * */

import { IconAlertTriangle, IconBeach, IconBuildings, IconBus, IconBusStop, IconCalendarEvent, IconCalendarStar, IconClock, IconFileCertificate, IconFileCheck, IconHome, IconKey, IconLayoutCollage, IconListCheck, IconNote, IconRocket, IconRoute, IconSitemap, IconTicket, IconTopologyStar3, IconUser } from '@tabler/icons-react';
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
		href: PAGE_ROUTES.alerts.ALERTS_LIST,
		icon: <IconAlertTriangle size={26} />,
		label: 'Alertas',
		permissions: [{ action: PermissionCatalog.all.alerts.actions.read, resources: { agency_ids: [], reference_types: [] }, scope: PermissionCatalog.all.alerts.scope }],
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
		permissions: [{ action: PermissionCatalog.all.annotations.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.annotations.scope }],
	},
	{
		_id: 'year_periods',
		href: PAGE_ROUTES.dates.YEAR_PERIODS_LIST,
		icon: <IconClock size={26} />,
		label: 'Períodos',
		permissions: [{ action: PermissionCatalog.all.year_periods.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.year_periods.scope }],
	},
	{
		_id: 'holidays',
		href: PAGE_ROUTES.dates.HOLIDAYS_LIST,
		icon: <IconBeach size={26} />,
		label: 'Feriados',
		permissions: [{ action: PermissionCatalog.all.holidays.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.holidays.scope }],
	},
	{
		_id: 'events',
		href: PAGE_ROUTES.dates.EVENTS_LIST,
		icon: <IconCalendarStar size={26} />,
		label: 'Eventos',
		permissions: [{ action: PermissionCatalog.all.events.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.events.scope }],
	},
	{
		_id: 'dates',
		href: PAGE_ROUTES.dates.CALENDAR_LIST,
		icon: <IconCalendarEvent size={26} />,
		label: 'Calendário',
		permissions: [
			{ action: PermissionCatalog.all.year_periods.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.year_periods.scope },
			{ action: PermissionCatalog.all.annotations.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.annotations.scope },
		],
	},
	{
		_id: 'fares',
		href: PAGE_ROUTES.offer.FARES_LIST,
		icon: <IconTicket size={26} />,
		label: 'Tarifas',
		permissions: [{ action: PermissionCatalog.all.fares.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.fares.scope }],
	},
	{
		_id: 'zones',
		href: PAGE_ROUTES.offer.ZONES_LIST,
		icon: <IconLayoutCollage size={26} />,
		label: 'Zonas',
		permissions: [{ action: PermissionCatalog.all.zones.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.zones.scope }],
	},
	{
		_id: 'typologies',
		href: PAGE_ROUTES.offer.TYPOLOGIES_LIST,
		icon: <IconTopologyStar3 size={26} />,
		label: 'Tipologias',
		permissions: [{ action: PermissionCatalog.all.typologies.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.typologies.scope }],
	},
	{
		_id: 'vehicles',
		href: PAGE_ROUTES.fleet.VEHICLES_LIST,
		icon: <IconBus size={26} />,
		label: 'Veículos',
		permissions: [{ action: PermissionCatalog.all.vehicles.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.vehicles.scope }],
	},
	{
		_id: 'lines',
		href: PAGE_ROUTES.offer.LINES_LIST,
		icon: <IconRoute size={26} />,
		label: 'Linhas',
		permissions: [{ action: PermissionCatalog.all.lines.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.lines.scope }],
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
