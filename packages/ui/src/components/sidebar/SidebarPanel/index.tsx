'use client';

/* * */

import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from '@tabler/icons-react';
import { type Permission } from '@tmlmobilidade/types';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { IconButton } from '../../buttons';
import { AppWrapperLogo } from '../../wrapper/AppWrapperLogo';
import { sidebarApps } from '../sidebar-navigation.config';
import { SidebarFooter } from '../SidebarFooter';
import { SidebarGreeting } from '../SidebarGreeting';
import { SidebarTreeNode } from '../SidebarTreeNode';

/* * */

export interface SidebarPanelProps {
	collapsedPref: boolean
	expanded: boolean
	onSetCollapsed: (collapsed: boolean) => void
	pathname?: string
	showToggle: boolean
	userPermissions?: readonly Permission[]
}

export function SidebarPanel({ collapsedPref, expanded, onSetCollapsed, pathname, showToggle, userPermissions }: SidebarPanelProps) {
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
				<div className={styles.sidebarScroll} data-sidebar-scroll>
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

			<div className={styles.sidebarFooterSlot} data-sidebar-footer-slot>
				<SidebarFooter
					iconOnly={!expanded}
					menuPosition={expanded ? 'bottom-end' : 'right-start'}
				/>
			</div>
		</>
	);
}
