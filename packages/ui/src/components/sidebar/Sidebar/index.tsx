'use client';

/* * */

import { Collapse } from '@mantine/core';
import { IconAlertTriangle, IconBeach, IconBook, IconBuildings, IconBus, IconBusStop, IconCalendarEvent, IconCalendarStar, IconChevronDown, IconClock, IconDeviceSim, IconFileCertificate, IconFileCheck, IconHome, IconKey, IconLayoutCollage, IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand, IconListCheck, IconNote, IconRocket, IconRoute, IconSitemap, IconTicket, IconTopologyStar3, IconUser } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Permission, PermissionCatalog } from '@tmlmobilidade/types';
import { type CSSProperties, type JSX, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useMeContext } from '../../../contexts/Me.context';
import { useCurrentUrl } from '../../../hooks/use-current-url';
import { IconButton } from '../../buttons';
import { AppWrapperLogo } from '../../wrapper/AppWrapperLogo';
import { clampSidebarRailWidth, SIDEBAR_COLLAPSED_WIDTH } from '../sidebar-rail-width';
import { SidebarFooter } from '../SidebarFooter';
import { SidebarGreeting } from '../SidebarGreeting';
import { SidebarGroupOpenProvider, useSidebarGroupOpen } from '../SidebarGroupOpen.context';
import { SidebarItem } from '../SidebarItem';
import { SidebarModeContext, type SidebarVisualMode, useSidebarMode } from '../SidebarMode.context';

/* * */

export interface SidebarLeafItemConfig {
	_id: string
	href: string
	icon: JSX.Element
	permissions: readonly Permission[]
	type: 'item'
}

export interface SidebarGroupItemConfig {
	_id: string
	children: readonly SidebarNodeConfig[]
	permissions?: readonly Permission[]
	type: 'group'
}

export type SidebarNodeConfig = SidebarGroupItemConfig | SidebarLeafItemConfig;

const sidebarItem = (config: Omit<SidebarLeafItemConfig, 'type'>): SidebarLeafItemConfig => ({
	...config,
	type: 'item',
});

const sidebarGroup = (config: Omit<SidebarGroupItemConfig, 'type'>): SidebarGroupItemConfig => ({
	...config,
	type: 'group',
});

export const sidebarApps = [
	sidebarGroup({
		_id: 'overview',
		children: [
			sidebarItem({
				_id: 'home',
				href: PAGE_ROUTES.auth.HOME_LIST,
				icon: <IconHome size={20} />,
				permissions: [
					{ action: PermissionCatalog.all.home.actions.read_links, scope: PermissionCatalog.all.home.scope },
					{ action: PermissionCatalog.all.home.actions.read_wiki, scope: PermissionCatalog.all.home.scope },
				],
			}),
			sidebarItem({
				_id: 'performance',
				href: PAGE_ROUTES.performance.BASE,
				icon: <IconRocket size={20} />,
				permissions: [{ action: PermissionCatalog.all.performance.actions.read, scope: PermissionCatalog.all.performance.scope }],
			}),
		],
	}),
	sidebarGroup({
		_id: 'administration',
		children: [
			sidebarItem({
				_id: 'users',
				href: PAGE_ROUTES.auth.USERS_LIST,
				icon: <IconUser size={20} />,
				permissions: [{ action: PermissionCatalog.all.users.actions.read, scope: PermissionCatalog.all.users.scope }],
			}),
			sidebarItem({
				_id: 'roles',
				href: PAGE_ROUTES.auth.ROLES_LIST,
				icon: <IconKey size={20} />,
				permissions: [{ action: PermissionCatalog.all.roles.actions.read, scope: PermissionCatalog.all.roles.scope }],
			}),
			sidebarItem({
				_id: 'agencies',
				href: PAGE_ROUTES.auth.AGENCIES_LIST,
				icon: <IconBuildings size={20} />,
				permissions: [{ action: PermissionCatalog.all.agencies.actions.read, scope: PermissionCatalog.all.agencies.scope }],
			}),
			sidebarItem({
				_id: 'organizations',
				href: PAGE_ROUTES.auth.ORGANIZATIONS_LIST,
				icon: <IconSitemap size={20} />,
				permissions: [{ action: PermissionCatalog.all.organizations.actions.read, scope: PermissionCatalog.all.organizations.scope }],
			}),
		],
	}),
	sidebarGroup({
		_id: 'operations',
		children: [
			sidebarItem({
				_id: 'alerts',
				href: PAGE_ROUTES.alerts.ALERTS_LIST,
				icon: <IconAlertTriangle size={20} />,
				permissions: [{ action: PermissionCatalog.all.alerts.actions.read, resources: { agency_ids: [], reference_types: [] }, scope: PermissionCatalog.all.alerts.scope }],
			}),
			sidebarItem({
				_id: 'rides',
				href: PAGE_ROUTES.controller.RIDES_LIST,
				icon: <IconListCheck size={20} />,
				permissions: [{ action: PermissionCatalog.all.rides.actions.analysis_read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.rides.scope }],
			}),
			sidebarItem({
				_id: 'sams',
				href: PAGE_ROUTES.controller.SAMS_LIST,
				icon: <IconDeviceSim size={20} />,
				permissions: [{ action: PermissionCatalog.all.sams.actions.read, scope: PermissionCatalog.all.sams.scope }],
			}),
			sidebarItem({
				_id: 'vehicles',
				href: PAGE_ROUTES.fleet.VEHICLES_LIST,
				icon: <IconBus size={20} />,
				permissions: [{ action: PermissionCatalog.all.vehicles.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.vehicles.scope }],
			}),
		],
	}),
	sidebarGroup({
		_id: 'network_offer',
		children: [
			sidebarItem({
				_id: 'stops',
				href: PAGE_ROUTES.stops.STOPS_LIST,
				icon: <IconBusStop size={20} />,
				permissions: [{ action: PermissionCatalog.all.stops.actions.read, resources: { agency_ids: [], municipality_ids: [] }, scope: PermissionCatalog.all.stops.scope }],
			}),
			sidebarItem({
				_id: 'lines',
				href: PAGE_ROUTES.offer.LINES_LIST,
				icon: <IconRoute size={20} />,
				permissions: [{ action: PermissionCatalog.all.lines.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.lines.scope }],
			}),
			sidebarItem({
				_id: 'typologies',
				href: PAGE_ROUTES.offer.TYPOLOGIES_LIST,
				icon: <IconTopologyStar3 size={20} />,
				permissions: [{ action: PermissionCatalog.all.typologies.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.typologies.scope }],
			}),
			sidebarItem({
				_id: 'fares',
				href: PAGE_ROUTES.offer.FARES_LIST,
				icon: <IconTicket size={20} />,
				permissions: [{ action: PermissionCatalog.all.fares.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.fares.scope }],
			}),
			sidebarItem({
				_id: 'zones',
				href: PAGE_ROUTES.offer.ZONES_LIST,
				icon: <IconLayoutCollage size={20} />,
				permissions: [{ action: PermissionCatalog.all.zones.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.zones.scope }],
			}),
		],
	}),
	sidebarGroup({
		_id: 'service_planning',
		children: [
			sidebarItem({
				_id: 'plans',
				href: PAGE_ROUTES.plans.APPROVED_LIST,
				icon: <IconFileCertificate size={20} />,
				permissions: [{ action: PermissionCatalog.all.plans.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.plans.scope }],
			}),
			sidebarItem({
				_id: 'gtfs_validations',
				href: PAGE_ROUTES.plans.VALIDATIONS_LIST,
				icon: <IconFileCheck size={20} />,
				permissions: [{ action: PermissionCatalog.all.gtfs_validations.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.gtfs_validations.scope }],
			}),
		],
	}),
	sidebarGroup({
		_id: 'calendar_management',
		children: [
			sidebarItem({
				_id: 'calendar',
				href: PAGE_ROUTES.dates.CALENDAR_LIST,
				icon: <IconCalendarEvent size={20} />,
				permissions: [
					{ action: PermissionCatalog.all.year_periods.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.year_periods.scope },
					{ action: PermissionCatalog.all.annotations.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.annotations.scope },
				],
			}),
			sidebarItem({
				_id: 'year_periods',
				href: PAGE_ROUTES.dates.YEAR_PERIODS_LIST,
				icon: <IconClock size={20} />,
				permissions: [{ action: PermissionCatalog.all.year_periods.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.year_periods.scope }],
			}),
			sidebarItem({
				_id: 'annotations',
				href: PAGE_ROUTES.dates.ANNOTATIONS_LIST,
				icon: <IconNote size={20} />,
				permissions: [{ action: PermissionCatalog.all.annotations.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.annotations.scope }],
			}),
			sidebarItem({
				_id: 'events',
				href: PAGE_ROUTES.dates.EVENTS_LIST,
				icon: <IconCalendarStar size={20} />,
				permissions: [{ action: PermissionCatalog.all.events.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.events.scope }],
			}),
			sidebarItem({
				_id: 'holidays',
				href: PAGE_ROUTES.dates.HOLIDAYS_LIST,
				icon: <IconBeach size={20} />,
				permissions: [{ action: PermissionCatalog.all.holidays.actions.read, resources: { agency_ids: [] }, scope: PermissionCatalog.all.holidays.scope }],
			}),
		],
	}),
	sidebarGroup({
		_id: 'reference_tools',
		children: [
			sidebarItem({
				_id: 'reference',
				href: PAGE_ROUTES.root.REFERENCE_LIST,
				icon: <IconBook size={20} />,
				permissions: [],
			}),
		],
	}),
] as const satisfies readonly SidebarNodeConfig[];

const firstLeafIconFromNodes = (nodes: readonly SidebarNodeConfig[]): JSX.Element | undefined => {
	for (const n of nodes) {
		if (n.type === 'item') return n.icon;
		const nested = firstLeafIconFromNodes(n.children);
		if (nested) return nested;
	}

	return;
};

const leafIconByIdFromNodes = (nodes: readonly SidebarNodeConfig[], id: string): JSX.Element | undefined => {
	for (const n of nodes) {
		if (n._id === id) {
			return n.type === 'item' ? n.icon : firstLeafIconFromNodes(n.children);
		}

		if (n.type === 'group') {
			const nested = leafIconByIdFromNodes(n.children, id);
			if (nested) return nested;
		}
	}

	return;
};

/** Icon for notifications / summaries.
 * If `scope` matches a leaf `_id`, return its icon.
 * If `scope` matches a group `_id`, return the first leaf icon under that group.
 */
export const getSidebarScopeRepresentativeIcon = (scope: string): JSX.Element | undefined => {
	return leafIconByIdFromNodes(sidebarApps, scope);
};

const getItemPathname = (href: string) => {
	if (URL.canParse(href)) return new URL(href).pathname;

	const hrefWithoutQuery = href.split('?')[0];
	const hrefWithoutHash = hrefWithoutQuery.split('#')[0];
	return hrefWithoutHash;
};

const normalizePathname = (pathname: string) => {
	if (pathname === '/') return '/';
	const normalized = pathname.replace(/\/+$/, '');
	return normalized.length ? normalized : '/';
};

const isPermissionEnabled = (permissions: readonly Permission[], userPermissions?: readonly Permission[]) => {
	if (!permissions.length) return true;
	if (!userPermissions) return false;
	return permissions.some(permissionObject => PermissionCatalog.hasPermission([...userPermissions], permissionObject.scope, permissionObject.action));
};

const isItemActive = (href: string, currentPathname?: string) => {
	if (!currentPathname) return false;

	const itemPathname = normalizePathname(getItemPathname(href));
	const current = normalizePathname(currentPathname);

	if (itemPathname === '/') return current === '/';
	return current === itemPathname || current.startsWith(`${itemPathname}/`);
};

const isNodeVisible = (node: SidebarNodeConfig, userPermissions?: readonly Permission[]) => {
	if (node.type === 'item') {
		return isPermissionEnabled(node.permissions, userPermissions);
	}

	if (node.permissions && !isPermissionEnabled(node.permissions, userPermissions)) {
		return false;
	}

	return node.children.some(child => isNodeVisible(child, userPermissions));
};

const isNodeActive = (node: SidebarNodeConfig, pathname?: string) => {
	if (node.type === 'item') {
		return isItemActive(node.href, pathname);
	}

	return node.children.some(child => isNodeActive(child, pathname));
};

interface SidebarTreeNodeProps {
	depth: number
	node: SidebarNodeConfig
	pathname?: string
	userPermissions?: readonly Permission[]
}

function SidebarTreeNode({ depth, node, pathname, userPermissions }: SidebarTreeNodeProps) {
	const { t } = useTranslation();
	const { iconOnly } = useSidebarMode();
	const { isGroupOpen, setGroupOpen, toggleGroup } = useSidebarGroupOpen();
	const isActive = isNodeActive(node, pathname);

	const isOpen = node.type === 'group' ? isGroupOpen(node._id) : false;

	useEffect(() => {
		if (node.type === 'group' && isActive) setGroupOpen(node._id, true);
	}, [isActive, node, setGroupOpen]);

	if (node.type === 'item') {
		if (!isPermissionEnabled(node.permissions, userPermissions)) {
			return null;
		}

		return (
			<SidebarItem
				depth={depth}
				label={t(`shared:components.sidebar.Sidebar.${node._id}`)}
				{...node}
			/>
		);
	}

	if (node.permissions && !isPermissionEnabled(node.permissions, userPermissions)) {
		return null;
	}

	const visibleChildren = node.children.filter(child => isNodeVisible(child, userPermissions));

	if (!visibleChildren.length) {
		return null;
	}

	return (
		<section className={styles.group}>
			<button
				aria-expanded={isOpen}
				aria-label={t(`shared:components.sidebar.SidebarGroups.${node._id}`)}
				className={styles.groupHeader}
				data-collapsed={iconOnly}
				onClick={() => toggleGroup(node._id)}
				type="button"
			>
				<span aria-hidden="true" className={styles.groupRule} />
				<span className={styles.groupLabel}>{t(`shared:components.sidebar.SidebarGroups.${node._id}`)}</span>
				<IconChevronDown className={styles.groupChevron} data-open={isOpen} size={14} />
			</button>
			<Collapse expanded={isOpen}>
				<div className={styles.groupChildren}>
					{visibleChildren.map(child => (
						<SidebarTreeNode
							key={child._id}
							depth={depth + 1}
							node={child}
							pathname={pathname}
							userPermissions={userPermissions}
						/>
					))}
				</div>
			</Collapse>
		</section>
	);
}

const getDefaultOpenGroupIds = (pathname?: string): string[] => {
	return sidebarApps
		.filter((node): node is SidebarGroupItemConfig => node.type === 'group' && isNodeActive(node, pathname))
		.map(node => node._id);
};

interface SidebarPanelProps {
	collapsedPref: boolean
	expanded: boolean
	onSetCollapsed: (collapsed: boolean) => void
	pathname?: string
	showToggle: boolean
	userPermissions?: readonly Permission[]
}

function SidebarPanel({ collapsedPref, expanded, onSetCollapsed, pathname, showToggle, userPermissions }: SidebarPanelProps) {
	const { t } = useTranslation();
	const isPeek = expanded && collapsedPref;

	return (
		<>
			<div className={styles.sidebarHeader} data-expanded={expanded}>
				<AppWrapperLogo />
				{expanded ? (
					<div className={styles.sidebarHeaderGreeting}>
						<SidebarGreeting />
					</div>
				) : null}
				{showToggle ? (
					isPeek ? (
						<IconButton
							aria-label={t('shared:components.sidebar.Sidebar.pin_sidebar_aria')}
							color="var(--color-system-text-200)"
							icon={<IconLayoutSidebarLeftExpand size={20} />}
							onClick={() => onSetCollapsed(false)}
						/>
					) : (
						<IconButton
							aria-label={t('shared:components.sidebar.Sidebar.unpin_sidebar_aria')}
							color="var(--color-system-text-200)"
							icon={<IconLayoutSidebarLeftCollapse size={20} />}
							onClick={() => onSetCollapsed(true)}
						/>
					)
				) : null}
			</div>
			<div className={styles.sidebarContent}>
				<div className={styles.sidebarScroll}>
					{sidebarApps.map(node => (
						<SidebarTreeNode
							key={node._id}
							depth={0}
							node={node}
							pathname={pathname}
							userPermissions={userPermissions}
						/>
					))}
				</div>
			</div>

			<div className={styles.sidebarFooterSlot}>
				<SidebarFooter
					iconOnly={!expanded}
					menuPosition={expanded ? 'bottom-end' : 'right-start'}
				/>
			</div>
		</>
	);
}

const sidebarModeContextValue = (
	visualMode: SidebarVisualMode,
	expanded: boolean,
) => ({
	expanded,
	iconOnly: !expanded,
	visualMode,
});

/* * */

export interface SidebarProps {
	collapsed: boolean
	onCollapsedChange: (collapsed: boolean) => void
	onWidthPxChange: (widthPx: number) => void
	widthPx: number
}

/* * */

export function Sidebar({ collapsed, onCollapsedChange, onWidthPxChange, widthPx }: SidebarProps) {
	const meContext = useMeContext();
	const currentUrl = useCurrentUrl();
	const { t } = useTranslation();

	const pathname = currentUrl?.pathname;
	const userPermissions = meContext.data.user?.permissions;

	const railRef = useRef<HTMLDivElement>(null);
	const peekOverlayRef = useRef<HTMLDivElement>(null);
	const [isHovering, setIsHovering] = useState(false);
	const [peekMounted, setPeekMounted] = useState(false);
	const [peekExpanded, setPeekExpanded] = useState(false);
	const [resizing, setResizing] = useState(false);

	const isPeekAnimating = collapsed && peekMounted;
	const visualMode: SidebarVisualMode = !collapsed
		? 'pinned'
		: isHovering || isPeekAnimating
			? 'hovered'
			: 'collapsed';

	const layoutWidthPx = collapsed ? SIDEBAR_COLLAPSED_WIDTH : widthPx;

	useEffect(() => {
		if (!collapsed) {
			setPeekMounted(false);
			setPeekExpanded(false);
			return;
		}

		if (isHovering) {
			setPeekMounted(true);
			const frame = requestAnimationFrame(() => {
				setPeekExpanded(true);
			});
			return () => {
				cancelAnimationFrame(frame);
			};
		}

		setPeekExpanded(false);
	}, [collapsed, isHovering]);

	useEffect(() => {
		if (!peekMounted || peekExpanded) return;

		const el = peekOverlayRef.current;
		const finish = () => {
			setPeekMounted(false);
		};

		if (!el) {
			finish();
			return;
		}

		const onTransitionEnd = (event: TransitionEvent) => {
			if (event.target !== el || event.propertyName !== 'width') return;
			finish();
		};

		el.addEventListener('transitionend', onTransitionEnd);
		const timeout = window.setTimeout(finish, 360);

		return () => {
			el.removeEventListener('transitionend', onTransitionEnd);
			window.clearTimeout(timeout);
		};
	}, [peekExpanded, peekMounted]);

	useEffect(() => {
		if (!resizing) return;

		const onMove = (e: MouseEvent) => {
			const el = railRef.current;
			if (!el) return;
			const left = el.getBoundingClientRect().left;
			onWidthPxChange(clampSidebarRailWidth(e.clientX - left));
		};

		const onUp = () => {
			setResizing(false);
		};

		document.addEventListener('mousemove', onMove);
		document.addEventListener('mouseup', onUp);
		document.body.style.userSelect = 'none';
		document.body.style.cursor = 'col-resize';

		return () => {
			document.removeEventListener('mousemove', onMove);
			document.removeEventListener('mouseup', onUp);
			document.body.style.userSelect = '';
			document.body.style.cursor = '';
		};
	}, [onWidthPxChange, resizing]);

	const railStyle = {
		flex: `0 0 ${layoutWidthPx}px`,
		maxWidth: `${layoutWidthPx}px`,
		minWidth: `${layoutWidthPx}px`,
		width: `${layoutWidthPx}px`,
	} as const;

	const handleSetCollapsed = (nextCollapsed: boolean) => {
		if (nextCollapsed) {
			setIsHovering(false);
		}

		onCollapsedChange(nextCollapsed);
	};

	const panelProps = {
		collapsedPref: collapsed,
		onSetCollapsed: handleSetCollapsed,
		pathname,
		userPermissions,
	};

	const defaultOpenGroupIds = getDefaultOpenGroupIds(pathname);
	const labelsVisible = visualMode !== 'collapsed';
	const showToggle = visualMode !== 'collapsed';

	return (
		<>
			{isPeekAnimating ? (
				<div
					aria-hidden={!peekExpanded}
					className={styles.peekBackdrop}
					data-visible={peekExpanded}
					onClick={() => setIsHovering(false)}
				/>
			) : null}
			<SidebarGroupOpenProvider defaultOpenGroupIds={defaultOpenGroupIds}>
				<div
					ref={railRef}
					className={styles.sidebarShell}
					data-resizing={resizing}
					data-sidebar-mode={visualMode}
					style={railStyle}
					onMouseEnter={() => {
						if (collapsed) setIsHovering(true);
					}}
					onMouseLeave={() => {
						if (collapsed) setIsHovering(false);
					}}
				>
					<SidebarModeContext.Provider value={sidebarModeContextValue(visualMode, labelsVisible)}>
						<div
							ref={peekOverlayRef}
							className={styles.sidebarPanel}
							data-peek-expanded={peekExpanded}
							style={collapsed ? {
								'--sidebar-peek-width-collapsed': `${SIDEBAR_COLLAPSED_WIDTH}px`,
								'--sidebar-peek-width-expanded': `${widthPx}px`,
							} as CSSProperties : undefined}
						>
							<SidebarPanel
								expanded={labelsVisible}
								showToggle={showToggle}
								{...panelProps}
							/>
						</div>
					</SidebarModeContext.Provider>

					{visualMode === 'pinned' ? (
						<div
							aria-label={t('shared:components.sidebar.Sidebar.resize_rail_aria')}
							aria-orientation="vertical"
							className={styles.resizeHandle}
							role="separator"
							onMouseDown={(e) => {
								e.preventDefault();
								setResizing(true);
							}}
						/>
					) : null}
				</div>
			</SidebarGroupOpenProvider>
		</>
	);
}
