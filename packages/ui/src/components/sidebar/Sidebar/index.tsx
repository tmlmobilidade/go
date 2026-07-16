'use client';

/* * */

import { type CSSProperties } from 'react';

import styles from './styles.module.css';

import { useMeContext } from '../../../contexts/Me.context';
import { useCurrentUrl } from '../../../hooks/use-current-url';
import { Surface } from '../../layout';
import { SIDEBAR_COLLAPSED_WIDTH } from '../sidebar-layout.constants';
import { SidebarOpenGroupsProvider } from '../SidebarOpenGroups.context';
import { SidebarPanel } from '../SidebarPanel';
import { type SidebarVisualMode, SidebarVisualModeContext } from '../SidebarVisualMode.context';
import { getDefaultOpenGroupIds } from '../utils';
import { useSidebarPeekState } from './useSidebarPeekState';

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

export interface SidebarProps {
	collapsed: boolean
	onCollapsedChange: (collapsed: boolean) => void
	onWidthPxChange: (widthPx: number) => void
	widthPx: number

}

/* * */

export function Sidebar({ collapsed, onCollapsedChange, widthPx }: SidebarProps) {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const currentUrl = useCurrentUrl();

	const pathname = currentUrl?.pathname;
	const userPermissions = meContext.data.user?.permissions;

	const defaultOpenGroupIds = getDefaultOpenGroupIds(pathname);

	const {
		isPeekAnimating,
		labelsVisible,
		peekExpanded,
		peekOverlayRef,
		setIsHovering,
		showToggle,
		visualMode,
	} = useSidebarPeekState({ collapsed });

	const railStyle = {
		flex: `0 0 auto`,
		maxWidth: `${SIDEBAR_COLLAPSED_WIDTH}px`,
		minWidth: `auto`,
		width: `auto`,
	} as const;

	const handleSetCollapsed = (nextCollapsed: boolean) => {
		if (nextCollapsed) setIsHovering(false);
		onCollapsedChange(nextCollapsed);
	};

	const panelProps = {
		collapsedPref: collapsed,
		onSetCollapsed: handleSetCollapsed,
		pathname,
		userPermissions,
	};

	//
	// B. Render components

	return (
		<>

			{isPeekAnimating && (
				<div
					aria-hidden={!peekExpanded}
					className={styles.peekBackdrop}
					data-visible={peekExpanded}
				/>
			)}

			<SidebarOpenGroupsProvider defaultOpenGroupIds={defaultOpenGroupIds}>
				<div
					className={styles.sidebarShell}
					data-sidebar-mode={visualMode}
					style={railStyle}
					onMouseEnter={() => {
						if (collapsed) setIsHovering(true);
					}}
					onMouseLeave={() => {
						if (collapsed) setIsHovering(false);
					}}
				>
					<SidebarVisualModeContext.Provider value={sidebarVisualModeContextValue(visualMode, labelsVisible)}>
						<div
							ref={peekOverlayRef}
							className={styles.sidebarPanel}
							data-peek-expanded={peekExpanded}
							style={collapsed ? {
								'--sidebar-peek-width-collapsed': `${SIDEBAR_COLLAPSED_WIDTH}px`,
								'--sidebar-peek-width-expanded': `${widthPx}px`,
							} as CSSProperties : undefined}
						>
							<Surface>
								<SidebarPanel
									expanded={labelsVisible}
									showToggle={showToggle}
									{...panelProps}
								/>
							</Surface>
						</div>
					</SidebarVisualModeContext.Provider>

				</div>
			</SidebarOpenGroupsProvider>
		</>
	);
}
