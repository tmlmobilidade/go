'use client';

/* * */

import { IconBell, IconChevronDown, IconCloudUpload, IconLayoutSidebarLeftCollapse, IconSettings } from '@tabler/icons-react';
import clsx from 'clsx';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

import footerStyles from '../SidebarFooter/styles.module.css';
import itemStyles from '../SidebarItem/styles.module.css';
import panelStyles from '../SidebarPanel/styles.module.css';
import treeStyles from '../SidebarTreeNode/styles.module.css';
import styles from './styles.module.css';

import { Tag } from '../../tags/Tag';
import { type SidebarNavigationGroup, type SidebarNavigationItem, type SidebarNavigationNode, sidebarNavigationTree } from '../sidebar-navigation-tree';

/* * */

export type SidebarStaticGroupId = SidebarNavigationGroup['_id'];
export type SidebarStaticItemId = SidebarNavigationItem['_id'];

export interface SidebarStaticPanelProps {
	activeItemId?: SidebarStaticItemId
	environmentLabel?: string
	greeting?: string
	logoSrc?: string
	onActiveItemIdChange?: (itemId: SidebarStaticItemId) => void
	openGroupIds?: readonly SidebarStaticGroupId[]
	visibleGroupIds?: readonly SidebarStaticGroupId[]
	visibleItemIds?: readonly SidebarStaticItemId[]
}

/* * */

const isVisibleStaticItem = (child: SidebarNavigationNode, visibleItemSet?: Set<SidebarStaticItemId>): child is SidebarNavigationItem => {
	return child.type === 'item' && (!visibleItemSet || visibleItemSet.has(child._id));
};

/* * */

export function SidebarStaticPanel({
	activeItemId,
	environmentLabel = 'DEMO',
	greeting = 'OLÁ JOÃO',
	logoSrc,
	onActiveItemIdChange,
	openGroupIds = [],
	visibleGroupIds,
	visibleItemIds,
}: SidebarStaticPanelProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const visibleGroupSet = visibleGroupIds ? new Set(visibleGroupIds) : undefined;
	const openGroupSet = new Set(openGroupIds);
	const visibleItemSet = visibleItemIds ? new Set(visibleItemIds) : undefined;

	//
	// F. Render components

	return (
		<aside className={clsx(panelStyles.sidebarPanel, styles.staticPanel)}>
			<div className={panelStyles.sidebarHeader} data-expanded="true">
				<div className={styles.brandMark}>
					{logoSrc ? (
						<Image
							alt=""
							className={styles.logoImage}
							height={28}
							src={logoSrc}
							width={80}
							unoptimized
						/>
					) : (
						<>
							<span />
							<span />
							<span />
						</>
					)}
				</div>
				<div className={panelStyles.sidebarHeaderGreeting}>
					<strong className={styles.greeting}>{greeting}</strong>
				</div>
				<button aria-label="Minimizar menu" className={styles.headerButton} type="button">
					<IconLayoutSidebarLeftCollapse size={20} stroke={2} />
				</button>
			</div>
			<div className={panelStyles.sidebarContent}>
				<div className={panelStyles.sidebarScroll} data-sidebar-scroll>
					{sidebarNavigationTree.map((node) => {
						if (visibleGroupSet && !visibleGroupSet.has(node._id)) return null;

						const isOpen = openGroupSet.has(node._id);
						const groupLabel = t(`shared:components.sidebar.SidebarGroups.${node._id}` as never);
						const visibleChildren = node.children.filter(child => isVisibleStaticItem(child, visibleItemSet));

						return (
							<section key={node._id} className={treeStyles.group} data-sidebar-group>
								<button
									aria-expanded={isOpen}
									aria-label={groupLabel}
									className={treeStyles.groupHeader}
									data-collapsed="false"
									type="button"
								>
									<span aria-hidden="true" className={treeStyles.groupRule} />
									<span className={treeStyles.groupLabel}>{groupLabel}</span>
									<IconChevronDown className={treeStyles.groupChevron} data-open={isOpen} size={14} />
								</button>
								{isOpen ? (
									<div className={treeStyles.groupChildren} data-sidebar-group-children>
										{visibleChildren.map((child) => {
											const itemLabel = t(`shared:components.sidebar.Sidebar.${child._id}` as never);
											const isActive = child._id === activeItemId;

											return (
												<button
													key={child._id}
													aria-label={itemLabel}
													className={clsx(itemStyles.item, styles.itemButton)}
													data-active={isActive}
													data-collapsed="false"
													data-depth={1}
													data-disabled="false"
													onClick={() => onActiveItemIdChange?.(child._id)}
													type="button"
												>
													<span className={itemStyles.icon}>{child.icon}</span>
													<span className={itemStyles.label}>{itemLabel}</span>
												</button>
											);
										})}
									</div>
								) : null}
							</section>
						);
					})}
				</div>
			</div>
			<div className={footerStyles.footer} data-icon-only="false">
				<div className={footerStyles.footerRow}>
					<div className={footerStyles.envSlot}>
						<Tag label={environmentLabel} variant="primary" />
					</div>
					<div className={footerStyles.actions}>
						<button aria-label="Exportações" className={styles.footerButton} type="button">
							<IconCloudUpload size={20} stroke={2} />
							<span>1</span>
						</button>
						<button aria-label="Notificações" className={styles.footerButton} type="button">
							<IconBell size={20} stroke={2} />
						</button>
						<button aria-label="Definições" className={styles.footerButton} type="button">
							<IconSettings size={20} stroke={2} />
						</button>
					</div>
				</div>
			</div>
		</aside>
	);

	//
}
