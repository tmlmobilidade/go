'use client';

/* * */

import { IconAlertTriangle, IconBeach, IconBook, IconBuildings, IconBus, IconBusStop, IconCalendarEvent, IconCalendarStar, IconClock, IconDeviceSim, IconFileCertificate, IconFileCheck, IconHome, IconKey, IconLayoutCollage, IconListCheck, IconNote, IconRocket, IconRoute, IconSitemap, IconTicket, IconTopologyStar3, IconUser } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Permission, PermissionCatalog } from '@tmlmobilidade/types';
import { type JSX } from 'react';

import { i18nResourceKeysPtShared } from '../../i18n';

/* * */

export interface SidebarNavigationItem {
	_id: keyof typeof i18nResourceKeysPtShared.shared.components.sidebar.Sidebar
	href: string
	icon: JSX.Element
	permissions: readonly Permission[]
	type: 'item'
}

export interface SidebarNavigationGroup {
	_id: keyof typeof i18nResourceKeysPtShared.shared.components.sidebar.SidebarGroups
	children: readonly SidebarNavigationNode[]
	permissions?: readonly Permission[]
	type: 'group'
}

export type SidebarNavigationNode = SidebarNavigationGroup | SidebarNavigationItem;

const sidebarNavigationItem = (config: Omit<SidebarNavigationItem, 'type'>): SidebarNavigationItem => ({
	...config,
	type: 'item',
});

const sidebarNavigationGroup = (config: Omit<SidebarNavigationGroup, 'type'>): SidebarNavigationGroup => ({
	...config,
	type: 'group',
});

export const sidebarNavigationTree = [
	sidebarNavigationGroup({
		_id: 'overview',
		children: [
			sidebarNavigationItem({
				_id: 'home',
				href: PAGE_ROUTES.auth.HOME_LIST,
				icon: <IconHome size={20} />,
				permissions: [
					{ action: PermissionCatalog.all.home.actions.read_links, scope: PermissionCatalog.all.home.scope },
					{ action: PermissionCatalog.all.home.actions.read_wiki, scope: PermissionCatalog.all.home.scope },
				],
			}),
			sidebarNavigationItem({
				_id: 'performance',
				href: PAGE_ROUTES.performance.BASE,
				icon: <IconRocket size={20} />,
				permissions: [{ action: PermissionCatalog.all.performance.actions.read, scope: PermissionCatalog.all.performance.scope }],
			}),
			sidebarNavigationItem({
				_id: 'reference',
				href: PAGE_ROUTES.root.REFERENCE_LIST,
				icon: <IconBook size={20} />,
				permissions: [],
			}),
		],
	}),
	sidebarNavigationGroup({
		_id: 'administration',
		children: [
			sidebarNavigationItem({
				_id: 'users',
				href: PAGE_ROUTES.auth.USERS_LIST,
				icon: <IconUser size={20} />,
				permissions: [{ action: PermissionCatalog.all.users.actions.read, scope: PermissionCatalog.all.users.scope }],
			}),
			sidebarNavigationItem({
				_id: 'roles',
				href: PAGE_ROUTES.auth.ROLES_LIST,
				icon: <IconKey size={20} />,
				permissions: [{ action: PermissionCatalog.all.roles.actions.read, scope: PermissionCatalog.all.roles.scope }],
			}),
			sidebarNavigationItem({
				_id: 'agencies',
				href: PAGE_ROUTES.auth.AGENCIES_LIST,
				icon: <IconBuildings size={20} />,
				permissions: [{ action: PermissionCatalog.all.agencies.actions.read, scope: PermissionCatalog.all.agencies.scope }],
			}),
			sidebarNavigationItem({
				_id: 'organizations',
				href: PAGE_ROUTES.auth.ORGANIZATIONS_LIST,
				icon: <IconSitemap size={20} />,
				permissions: [{ action: PermissionCatalog.all.organizations.actions.read, scope: PermissionCatalog.all.organizations.scope }],
			}),
		],
	}),
	sidebarNavigationGroup({
		_id: 'operation',
		children: [
			sidebarNavigationItem({
				_id: 'rides',
				href: PAGE_ROUTES.controller.RIDES_LIST,
				icon: <IconListCheck size={20} />,
				permissions: [{ action: PermissionCatalog.all.rides.actions.analysis_read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.rides.scope }],
			}),
			sidebarNavigationItem({
				_id: 'alerts',
				href: PAGE_ROUTES.alerts.ALERTS_LIST,
				icon: <IconAlertTriangle size={20} />,
				permissions: [{ action: PermissionCatalog.all.alerts.actions.read, resources: { agency_ids: [], reference_types: [] }, scope: PermissionCatalog.all.alerts.scope }],
			}),
			sidebarNavigationItem({
				_id: 'plans',
				href: PAGE_ROUTES.plans.APPROVED_LIST,
				icon: <IconFileCertificate size={20} />,
				permissions: [{ action: PermissionCatalog.all.plans.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.plans.scope }],
			}),
			sidebarNavigationItem({
				_id: 'gtfs_validations',
				href: PAGE_ROUTES.plans.VALIDATIONS_LIST,
				icon: <IconFileCheck size={20} />,
				permissions: [{ action: PermissionCatalog.all.gtfs_validations.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.gtfs_validations.scope }],
			}),
			sidebarNavigationItem({
				_id: 'sams',
				href: PAGE_ROUTES.controller.SAMS_LIST,
				icon: <IconDeviceSim size={20} />,
				permissions: [{ action: PermissionCatalog.all.sams.actions.read, scope: PermissionCatalog.all.sams.scope }],
			}),
			sidebarNavigationItem({
				_id: 'vehicles',
				href: PAGE_ROUTES.fleet.VEHICLES_LIST,
				icon: <IconBus size={20} />,
				permissions: [{ action: PermissionCatalog.all.vehicles.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.vehicles.scope }],
			}),
		],
	}),
	sidebarNavigationGroup({
		_id: 'offer',
		children: [
			sidebarNavigationItem({
				_id: 'lines',
				href: PAGE_ROUTES.offer.LINES_LIST,
				icon: <IconRoute size={20} />,
				permissions: [{ action: PermissionCatalog.all.lines.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.lines.scope }],
			}),
			sidebarNavigationItem({
				_id: 'stops',
				href: PAGE_ROUTES.stops.STOPS_LIST,
				icon: <IconBusStop size={20} />,
				permissions: [{ action: PermissionCatalog.all.stops.actions.read, resources: { agency_ids: [], municipality_ids: [] }, scope: PermissionCatalog.all.stops.scope }],
			}),
			sidebarNavigationItem({
				_id: 'typologies',
				href: PAGE_ROUTES.offer.TYPOLOGIES_LIST,
				icon: <IconTopologyStar3 size={20} />,
				permissions: [{ action: PermissionCatalog.all.typologies.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.typologies.scope }],
			}),
			sidebarNavigationItem({
				_id: 'fares',
				href: PAGE_ROUTES.offer.FARES_LIST,
				icon: <IconTicket size={20} />,
				permissions: [{ action: PermissionCatalog.all.fares.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.fares.scope }],
			}),
			sidebarNavigationItem({
				_id: 'zones',
				href: PAGE_ROUTES.offer.ZONES_LIST,
				icon: <IconLayoutCollage size={20} />,
				permissions: [{ action: PermissionCatalog.all.zones.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.zones.scope }],
			}),
		],
	}),
	sidebarNavigationGroup({
		_id: 'calendar_management',
		children: [
			sidebarNavigationItem({
				_id: 'calendar',
				href: PAGE_ROUTES.dates.CALENDAR_LIST,
				icon: <IconCalendarEvent size={20} />,
				permissions: [
					{ action: PermissionCatalog.all.year_periods.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.year_periods.scope },
					{ action: PermissionCatalog.all.annotations.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.annotations.scope },
				],
			}),
			sidebarNavigationItem({
				_id: 'year_periods',
				href: PAGE_ROUTES.dates.YEAR_PERIODS_LIST,
				icon: <IconClock size={20} />,
				permissions: [{ action: PermissionCatalog.all.year_periods.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.year_periods.scope }],
			}),
			sidebarNavigationItem({
				_id: 'events',
				href: PAGE_ROUTES.dates.EVENTS_LIST,
				icon: <IconCalendarStar size={20} />,
				permissions: [{ action: PermissionCatalog.all.events.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.events.scope }],
			}),
			sidebarNavigationItem({
				_id: 'holidays',
				href: PAGE_ROUTES.dates.HOLIDAYS_LIST,
				icon: <IconBeach size={20} />,
				permissions: [{ action: PermissionCatalog.all.holidays.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.holidays.scope }],
			}),
			sidebarNavigationItem({
				_id: 'annotations',
				href: PAGE_ROUTES.dates.ANNOTATIONS_LIST,
				icon: <IconNote size={20} />,
				permissions: [{ action: PermissionCatalog.all.annotations.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.annotations.scope }],
			}),
		],
	}),
] as const satisfies readonly SidebarNavigationNode[];
