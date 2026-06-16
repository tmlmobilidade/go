'use client';

/* * */

import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from '@tabler/icons-react';
import { type Permission } from '@tmlmobilidade/types';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { IconButton } from '../../buttons';
import { AppWrapperLogo } from '../../wrapper/AppWrapperLogo';
import { sidebarNavigationTree } from '../sidebar-navigation-tree';
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

/* * */

export function SidebarPanel({ collapsedPref, expanded, onSetCollapsed, pathname, showToggle, userPermissions }: SidebarPanelProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	const isPeek = expanded && collapsedPref;
	const toggleAriaLabel = isPeek
		? t('shared:components.sidebar.Sidebar.pin_sidebar_aria')
		: t('shared:components.sidebar.Sidebar.unpin_sidebar_aria');
	const toggleIcon = isPeek
		? <IconLayoutSidebarLeftExpand size={20} />
		: <IconLayoutSidebarLeftCollapse size={20} />;

	//
	// C. Handle actions

	const handleToggleClick = () => {
		onSetCollapsed(!isPeek);
	};

	//
	// D. Render components

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
					<IconButton
						aria-label={toggleAriaLabel}
						color="var(--color-system-text-200)"
						icon={toggleIcon}
						onClick={handleToggleClick}
					/>
				) : null}
			</div>
			<div className={styles.sidebarContent}>
				<div className={styles.sidebarScroll} data-sidebar-scroll>
					{sidebarNavigationTree.map(node => (
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

	//
}
