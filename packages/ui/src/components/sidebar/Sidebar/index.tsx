'use client';

import { type CSSProperties, useState } from 'react';

import styles from './styles.module.css';

import { useMeContext } from '../../../contexts/Me.context';
import { useUserPreference } from '../../../hooks';
import { useCurrentUrl } from '../../../hooks/use-current-url';
import { Surface } from '../../layout/Surface';
import { SIDEBAR_LOGO_WIDTH_PX } from '../sidebar-layout.constants';
import { SidebarBackdrop } from '../SidebarBackdrop';
import { SidebarFooter } from '../SidebarFooter';
import { SidebarHeader } from '../SidebarHeader';
import { SidebarOpenGroupsProvider } from '../SidebarOpenGroups.context';
import { SidebarPanel } from '../SidebarPanel';
import { type SidebarVisualMode, SidebarVisualModeContext } from '../SidebarVisualMode.context';
import { getDefaultOpenGroupIds } from '../utils';

/* * */

const sidebarVisualModeContextValue = (
	visualMode: SidebarVisualMode,
	expanded: boolean,
) => ({
	expanded,
	iconOnly: !expanded,
	visualMode,
});

/* * */

export function Sidebar() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const currentUrl = useCurrentUrl();

	const [sidebarCollapsed] = useUserPreference<boolean>('ui', 'sidebar_hidden', false);

	const pathname = currentUrl?.pathname;
	const userPermissions = meContext.data.user?.permissions;

	const defaultOpenGroupIds = getDefaultOpenGroupIds(pathname);

	const [isHovering, setIsHovering] = useState(false);

	const visualMode: SidebarVisualMode = !sidebarCollapsed
		? 'pinned'
		: isHovering
			? 'hovered'
			: 'collapsed';

	//
	// B. Render components

	return (
		<>

			<SidebarBackdrop isVisible={isHovering} />

			<SidebarOpenGroupsProvider defaultOpenGroupIds={defaultOpenGroupIds}>
				<SidebarVisualModeContext.Provider value={sidebarVisualModeContextValue(visualMode, isHovering)}>
					<div
						className={styles.fixedContainer}
						data-peek-expanded={isHovering}
						data-sidebar-mode={visualMode}
						style={{ '--sidebar-width-collapsed': SIDEBAR_LOGO_WIDTH_PX } as CSSProperties}
						onMouseEnter={() => {
							if (sidebarCollapsed) setIsHovering(true);
						}}
						onMouseLeave={() => {
							if (sidebarCollapsed) setIsHovering(false);
						}}
					>
						<div className={styles.expandingContainer}>
							<Surface>

								<SidebarHeader
									expanded={isHovering || !sidebarCollapsed}
									showToggle={isHovering || !sidebarCollapsed}
								/>

								<SidebarPanel
									pathname={pathname}
									userPermissions={userPermissions}
								/>

								<SidebarFooter
									iconOnly={!(isHovering || !sidebarCollapsed)}
									menuPosition={(isHovering || !sidebarCollapsed) ? 'bottom-end' : 'right-start'}
								/>

							</Surface>
						</div>
					</div>
				</SidebarVisualModeContext.Provider>
			</SidebarOpenGroupsProvider>

		</>
	);
}
