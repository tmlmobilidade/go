'use client';

/* * */

import { IconAlertTriangle, IconBeach, IconBook, IconBuildings, IconBus, IconBusStop, IconCalendarEvent, IconCalendarStar, IconClock, IconDeviceSim, IconFileCertificate, IconFileCheck, IconHome, IconKey, IconLayoutCollage, IconListCheck, IconNote, IconRocket, IconRoute, IconSitemap, IconTicket, IconTopologyStar3, IconUser } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Permission, PermissionCatalog } from '@tmlmobilidade/types';
import { type JSX } from 'react';

import { i18nResourceKeysPtShared } from '../../i18n/resources';

/* * */

export interface SidebarNavigationGroup {
	_id: keyof typeof i18nResourceKeysPtShared.shared.components.sidebar.SidebarGroups
	items: SidebarNavigationGroupItem[]
}

export interface SidebarNavigationGroupItem {
	_id: keyof typeof i18nResourceKeysPtShared.shared.components.sidebar.Sidebar
	href: string
	icon: JSX.Element
	permissions: readonly Permission[]
}

/* * */

export const sidebarNavigationGroups = [
	{
		_id: 'overview',
		items: [
			{
				_id: 'home',
				href: PAGE_ROUTES.auth.HOME_LIST,
				icon: <IconHome />,
				permissions: [
					{ action: PermissionCatalog.all.home.actions.read_links, scope: PermissionCatalog.all.home.scope },
					{ action: PermissionCatalog.all.home.actions.read_wiki, scope: PermissionCatalog.all.home.scope },
				],
			},
			{
				_id: 'performance',
				href: PAGE_ROUTES.performance.BASE,
				icon: <IconRocket />,
				permissions: [{ action: PermissionCatalog.all.performance.actions.read, scope: PermissionCatalog.all.performance.scope }],
			},
			{
				_id: 'reference',
				href: PAGE_ROUTES.root.REFERENCE_LIST,
				icon: <IconBook />,
				permissions: [],
			},
		],
	},
	{
		_id: 'administration',
		items: [
			{
				_id: 'agencies',
				href: PAGE_ROUTES.auth.AGENCIES_LIST,
				icon: <IconBuildings />,
				permissions: [{ action: PermissionCatalog.all.agencies.actions.read, scope: PermissionCatalog.all.agencies.scope }],
			},
			{
				_id: 'organizations',
				href: PAGE_ROUTES.auth.ORGANIZATIONS_LIST,
				icon: <IconSitemap />,
				permissions: [{ action: PermissionCatalog.all.organizations.actions.read, scope: PermissionCatalog.all.organizations.scope }],
			},
			{
				_id: 'roles',
				href: PAGE_ROUTES.auth.ROLES_LIST,
				icon: <IconKey />,
				permissions: [{ action: PermissionCatalog.all.roles.actions.read, scope: PermissionCatalog.all.roles.scope }],
			},
			{
				_id: 'users',
				href: PAGE_ROUTES.auth.USERS_LIST,
				icon: <IconUser />,
				permissions: [{ action: PermissionCatalog.all.users.actions.read, scope: PermissionCatalog.all.users.scope }],
			},
		],
	},
	{
		_id: 'operation',
		items: [
			{
				_id: 'gtfs_validations',
				href: PAGE_ROUTES.plans.VALIDATIONS_LIST,
				icon: <IconFileCheck />,
				permissions: [{ action: PermissionCatalog.all.gtfs_validations.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.gtfs_validations.scope }],
			},
			{
				_id: 'plans',
				href: PAGE_ROUTES.plans.APPROVED_LIST,
				icon: <IconFileCertificate />,
				permissions: [{ action: PermissionCatalog.all.plans.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.plans.scope }],
			},
			{
				_id: 'alerts',
				href: PAGE_ROUTES.alerts.ALERTS_LIST,
				icon: <IconAlertTriangle />,
				permissions: [{ action: PermissionCatalog.all.alerts.actions.read, resources: { agency_ids: [], reference_types: [] }, scope: PermissionCatalog.all.alerts.scope }],
			},
			{
				_id: 'rides',
				href: PAGE_ROUTES.controller.RIDES_LIST,
				icon: <IconListCheck />,
				permissions: [{ action: PermissionCatalog.all.rides.actions.analysis_read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.rides.scope }],
			},
			{
				_id: 'sams',
				href: PAGE_ROUTES.controller.SAMS_LIST,
				icon: <IconDeviceSim />,
				permissions: [{ action: PermissionCatalog.all.sams.actions.read, scope: PermissionCatalog.all.sams.scope }],
			},
			{
				_id: 'vehicles',
				href: PAGE_ROUTES.fleet.VEHICLES_LIST,
				icon: <IconBus />,
				permissions: [{ action: PermissionCatalog.all.vehicles.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.vehicles.scope }],
			},
		],
	},
	{
		_id: 'offer',
		items: [
			{
				_id: 'stops',
				href: PAGE_ROUTES.stops.STOPS_LIST,
				icon: <IconBusStop />,
				permissions: [{ action: PermissionCatalog.all.stops.actions.read, resources: { agency_ids: [], municipality_ids: [] }, scope: PermissionCatalog.all.stops.scope }],
			},
			{
				_id: 'lines',
				href: PAGE_ROUTES.offer.LINES_LIST,
				icon: <IconRoute />,
				permissions: [{ action: PermissionCatalog.all.lines.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.lines.scope }],
			},
			{
				_id: 'typologies',
				href: PAGE_ROUTES.offer.TYPOLOGIES_LIST,
				icon: <IconTopologyStar3 />,
				permissions: [{ action: PermissionCatalog.all.typologies.actions.nav, resources: { agency_ids: [] }, scope: PermissionCatalog.all.typologies.scope }],
			},
			{
				_id: 'fares',
				href: PAGE_ROUTES.offer.FARES_LIST,
				icon: <IconTicket />,
				permissions: [{ action: PermissionCatalog.all.fares.actions.nav, resources: { agency_ids: [] }, scope: PermissionCatalog.all.fares.scope }],
			},
			{
				_id: 'zones',
				href: PAGE_ROUTES.offer.ZONES_LIST,
				icon: <IconLayoutCollage />,
				permissions: [{ action: PermissionCatalog.all.zones.actions.nav, resources: { agency_ids: [] }, scope: PermissionCatalog.all.zones.scope }],
			},
		],
	},
	{
		_id: 'calendar_management',
		items: [
			{
				_id: 'calendar',
				href: PAGE_ROUTES.dates.CALENDAR_LIST,
				icon: <IconCalendarEvent />,
				permissions: [
					{ action: PermissionCatalog.all.year_periods.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.year_periods.scope },
					{ action: PermissionCatalog.all.annotations.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.annotations.scope },
				],
			},
			{
				_id: 'events',
				href: PAGE_ROUTES.dates.EVENTS_LIST,
				icon: <IconCalendarStar />,
				permissions: [{ action: PermissionCatalog.all.events.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.events.scope }],
			},
			{
				_id: 'holidays',
				href: PAGE_ROUTES.dates.HOLIDAYS_LIST,
				icon: <IconBeach />,
				permissions: [{ action: PermissionCatalog.all.holidays.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.holidays.scope }],
			},
			{
				_id: 'year_periods',
				href: PAGE_ROUTES.dates.YEAR_PERIODS_LIST,
				icon: <IconClock />,
				permissions: [{ action: PermissionCatalog.all.year_periods.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.year_periods.scope }],
			},
			{
				_id: 'annotations',
				href: PAGE_ROUTES.dates.ANNOTATIONS_LIST,
				icon: <IconNote />,
				permissions: [{ action: PermissionCatalog.all.annotations.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.annotations.scope }],
			},
		],
	},
] as const satisfies readonly SidebarNavigationGroup[];
