'use client';

/* * */

import { IconAlertTriangle, IconBeach, IconBook, IconBuildings, IconBus, IconCalendarEvent, IconCalendarStar, IconClock, IconDeviceSim, IconFileCertificate, IconFileCheck, IconFlag2, IconHome, IconKey, IconLayoutCollage, IconListCheck, IconNote, IconRocket, IconRoute, IconSchool, IconSitemap, IconTicket, IconTopologyStar3, IconUser } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Permission } from '@tmlmobilidade/go-types-permissions';
import { type JSX } from 'react';

import { i18nResourceKeysPtShared } from '../../i18n/resources';

/* * */

export interface SidebarNavigationGroupType {
	_id: keyof typeof i18nResourceKeysPtShared.shared.components.sidebar.SidebarGroups
	items: SidebarNavigationGroupItemType[]
}

export interface SidebarNavigationGroupItemType {
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
				href: PAGE_ROUTES.core.HOME_LIST,
				icon: <IconHome />,
				permissions: [
					{ action: 'read_links', scope: 'home' },
					{ action: 'read_wiki', scope: 'home' },
				],
			},
			{
				_id: 'performance',
				href: PAGE_ROUTES.performance.BASE,
				icon: <IconRocket />,
				permissions: [{ action: 'read', scope: 'performance' }],
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
		_id: 'operation',
		items: [
			{
				_id: 'alerts',
				href: PAGE_ROUTES.operation.ALERTS_LIST,
				icon: <IconAlertTriangle />,
				permissions: [{ action: 'read', resources: { agency_ids: [], reference_types: [] }, scope: 'alerts' }],
			},
			{
				_id: 'gtfs_validations',
				href: PAGE_ROUTES.operation.GTFS_VALIDATIONS_LIST,
				icon: <IconFileCheck />,
				permissions: [{ action: 'read', resources: { agency_ids: [] }, scope: 'gtfs_validations' }],
			},
			{
				_id: 'plans',
				href: PAGE_ROUTES.operation.PLANS_LIST,
				icon: <IconFileCertificate />,
				permissions: [{ action: 'read', resources: { agency_ids: [] }, scope: 'plans' }],
			},
			{
				_id: 'rides',
				href: PAGE_ROUTES.operation.RIDES_LIST,
				icon: <IconListCheck />,
				permissions: [{ action: 'analysis_read', resources: { agency_ids: [] }, scope: 'rides' }],
			},
			{
				_id: 'sams',
				href: PAGE_ROUTES.operation.SAMS_LIST,
				icon: <IconDeviceSim />,
				permissions: [{ action: 'read', resources: { agency_ids: [] }, scope: 'sams' }],
			},
			{
				_id: 'vehicles',
				href: PAGE_ROUTES.operation.VEHICLES_LIST,
				icon: <IconBus />,
				permissions: [{ action: 'read', resources: { agency_ids: [] }, scope: 'vehicles' }],
			},
		],
	},
	{
		_id: 'offer',
		items: [
			{
				_id: 'lines',
				href: PAGE_ROUTES.offer.LINES_LIST,
				icon: <IconRoute />,
				permissions: [{ action: 'read', resources: { agency_ids: [] }, scope: 'lines' }],
			},
			{
				_id: 'typologies',
				href: PAGE_ROUTES.offer.TYPOLOGIES_LIST,
				icon: <IconTopologyStar3 />,
				permissions: [{ action: 'nav', resources: { agency_ids: [] }, scope: 'typologies' }],
			},
			{
				_id: 'fares',
				href: PAGE_ROUTES.offer.FARES_LIST,
				icon: <IconTicket />,
				permissions: [{ action: 'nav', resources: { agency_ids: [] }, scope: 'fares' }],
			},
			{
				_id: 'zones',
				href: PAGE_ROUTES.offer.ZONES_LIST,
				icon: <IconLayoutCollage />,
				permissions: [{ action: 'nav', resources: { agency_ids: [] }, scope: 'zones' }],
			},
		],
	},
	{
		_id: 'dates',
		items: [
			{
				_id: 'calendar',
				href: PAGE_ROUTES.dates.CALENDAR_LIST,
				icon: <IconCalendarEvent />,
				permissions: [
					{ action: 'read', resources: { agency_ids: [] }, scope: 'year_periods' },
					{ action: 'read', resources: { agency_ids: [] }, scope: 'annotations' },
				],
			},
			{
				_id: 'events',
				href: PAGE_ROUTES.dates.EVENTS_LIST,
				icon: <IconCalendarStar />,
				permissions: [{ action: 'read', resources: { agency_ids: [] }, scope: 'events' }],
			},
			{
				_id: 'holidays',
				href: PAGE_ROUTES.dates.HOLIDAYS_LIST,
				icon: <IconBeach />,
				permissions: [{ action: 'read', resources: { agency_ids: [] }, scope: 'holidays' }],
			},
			{
				_id: 'year_periods',
				href: PAGE_ROUTES.dates.YEAR_PERIODS_LIST,
				icon: <IconClock />,
				permissions: [{ action: 'read', resources: { agency_ids: [] }, scope: 'year_periods' }],
			},
			{
				_id: 'annotations',
				href: PAGE_ROUTES.dates.ANNOTATIONS_LIST,
				icon: <IconNote />,
				permissions: [{ action: 'read', resources: { agency_ids: [] }, scope: 'annotations' }],
			},
		],
	},
	{
		_id: 'infrastructure',
		items: [
			{
				_id: 'schools',
				href: PAGE_ROUTES.infrastructure.SCHOOLS_LIST,
				icon: <IconSchool />,
				permissions: [{ action: 'read', resources: { agency_ids: [] }, scope: 'schools' }],
			},
			{
				_id: 'stops',
				href: PAGE_ROUTES.infrastructure.STOPS_LIST,
				icon: <IconFlag2 />,
				permissions: [{ action: 'read', resources: { agency_ids: [], municipality_ids: [] }, scope: 'stops' }],
			},
		],
	},
	{
		_id: 'core',
		items: [
			{
				_id: 'agencies',
				href: PAGE_ROUTES.core.AGENCIES_LIST,
				icon: <IconBuildings />,
				permissions: [{ action: 'read', scope: 'agencies' }],
			},
			{
				_id: 'organizations',
				href: PAGE_ROUTES.core.ORGANIZATIONS_LIST,
				icon: <IconSitemap />,
				permissions: [{ action: 'read', scope: 'organizations' }],
			},
			{
				_id: 'roles',
				href: PAGE_ROUTES.core.ROLES_LIST,
				icon: <IconKey />,
				permissions: [{ action: 'read', scope: 'roles' }],
			},
			{
				_id: 'users',
				href: PAGE_ROUTES.core.USERS_LIST,
				icon: <IconUser />,
				permissions: [{ action: 'read', scope: 'users' }],
			},
		],
	},
] satisfies readonly SidebarNavigationGroupType[];
