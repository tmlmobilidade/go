'use client';

/* * */

import { Collapse } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { type Permission } from '@tmlmobilidade/types';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { type SidebarNodeConfig } from '../sidebar-navigation.config';
import { isNodeActive, isNodeVisible, isPermissionEnabled } from '../sidebar-navigation.model';
import { useSidebarGroupOpen } from '../SidebarGroupOpen.context';
import { SidebarItem } from '../SidebarItem';
import { useSidebarMode } from '../SidebarMode.context';

/* * */

export interface SidebarTreeNodeProps {
	depth: number
	node: SidebarNodeConfig
	pathname?: string
	userPermissions?: readonly Permission[]
}

/* * */

export function SidebarTreeNode({ depth, node, pathname, userPermissions }: SidebarTreeNodeProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { iconOnly } = useSidebarMode();
	const { isGroupOpen, setGroupOpen, toggleGroup } = useSidebarGroupOpen();

	//
	// B. Transform data

	const isActive = isNodeActive(node, pathname);

	const isOpen = node.type === 'group' ? isGroupOpen(node._id) : false;

	//
	// C. Handle actions

	useEffect(() => {
		if (node.type === 'group' && isActive) setGroupOpen(node._id, true);
	}, [isActive, node, setGroupOpen]);

	//
	// D. Render components

	if (node.type === 'item') {
		if (!isPermissionEnabled(node.permissions, userPermissions)) {
			return null;
		}

		const itemLabel = t(`shared:components.sidebar.Sidebar.${node._id}` as never);

		return (
			<SidebarItem
				depth={depth}
				label={itemLabel}
				pathname={pathname}
				userPermissions={userPermissions}
				{...node}
			/>
		);
	}

	if (node.permissions && !isPermissionEnabled(node.permissions, userPermissions)) {
		return null;
	}

	const groupLabel = t(`shared:components.sidebar.SidebarGroups.${node._id}` as never);
	const visibleChildren = node.children.filter(child => isNodeVisible(child, userPermissions));

	if (!visibleChildren.length) {
		return null;
	}

	return (
		<section className={styles.group} data-sidebar-group>
			<button
				aria-expanded={isOpen}
				aria-label={groupLabel}
				className={styles.groupHeader}
				data-collapsed={iconOnly}
				onClick={() => toggleGroup(node._id)}
				type="button"
			>
				<span aria-hidden="true" className={styles.groupRule} />
				<span className={styles.groupLabel}>{groupLabel}</span>
				<IconChevronDown className={styles.groupChevron} data-open={isOpen} size={14} />
			</button>
			<Collapse expanded={isOpen} transitionDuration={0}>
				<div className={styles.groupChildren} data-sidebar-group-children>
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

	//
}
