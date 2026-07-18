'use client';

import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { IconButton } from '../../buttons/IconButton';
import { useSidebarContext } from '../Sidebar.context';
import { SidebarHeaderGreeting } from '../SidebarHeaderGreeting';
import { SidebarHeaderLogo } from '../SidebarHeaderLogo';

/* * */

export function SidebarHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const sidebarContext = useSidebarContext();

	//
	// B. Transform data

	const toggleAriaLabel = sidebarContext.presentation.visual_mode !== 'collapsed'
		? t('shared:components.sidebar.Sidebar.pin_sidebar_aria')
		: t('shared:components.sidebar.Sidebar.unpin_sidebar_aria');

	const toggleIcon = sidebarContext.presentation.visual_mode !== 'collapsed'
		? <IconLayoutSidebarLeftExpand size={20} />
		: <IconLayoutSidebarLeftCollapse size={20} />;

	//
	// C. Render components

	return (
		<div className={styles.container}>
			<SidebarHeaderLogo />
			{sidebarContext.presentation.visual_mode !== 'collapsed' && (
				<>
					<SidebarHeaderGreeting />
					<IconButton
						aria-label={toggleAriaLabel}
						color="var(--color-system-text-200)"
						icon={toggleIcon}
						onClick={sidebarContext.presentation.toggleIsPinned}
					/>
				</>
			)}
		</div>
	);
}
