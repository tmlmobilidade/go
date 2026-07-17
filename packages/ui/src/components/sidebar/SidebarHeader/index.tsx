'use client';

import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useUserPreference } from '../../../hooks/use-user-preference';
import { IconButton } from '../../buttons';
import { AppWrapperLogo } from '../AppWrapperLogo';
import { SidebarGreeting } from '../SidebarGreeting';

/* * */

export interface SidebarHeaderProps {
	expanded: boolean
	showToggle: boolean
}

/* * */

export function SidebarHeader({ expanded, showToggle }: SidebarHeaderProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [sidebarCollapsed, setSidebarCollapsed] = useUserPreference<boolean>('ui', 'sidebar_hidden', false);

	//
	// B. Transform data

	const isPeek = expanded && sidebarCollapsed;

	const toggleAriaLabel = isPeek
		? t('shared:components.sidebar.Sidebar.pin_sidebar_aria')
		: t('shared:components.sidebar.Sidebar.unpin_sidebar_aria');
	const toggleIcon = isPeek
		? <IconLayoutSidebarLeftExpand size={20} />
		: <IconLayoutSidebarLeftCollapse size={20} />;

	//
	// C. Handle actions

	const handleToggleClick = () => {
		setSidebarCollapsed(!sidebarCollapsed);
	};

	//
	// D. Render components

	return (
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
	);
}
