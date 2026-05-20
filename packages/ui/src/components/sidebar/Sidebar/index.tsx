'use client';

/* * */

import { type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import panelStyles from '../SidebarPanel/styles.module.css';
import styles from './styles.module.css';

import { useMeContext } from '../../../contexts/Me.context';
import { useCurrentUrl } from '../../../hooks/use-current-url';
import { getDefaultOpenGroupIds } from '../sidebar-navigation.model';
import { SIDEBAR_COLLAPSED_WIDTH } from '../sidebar-rail-width';
import { SidebarGroupOpenProvider } from '../SidebarGroupOpen.context';
import { SidebarModeContext, type SidebarVisualMode } from '../SidebarMode.context';
import { SidebarPanel } from '../SidebarPanel';
import { useSidebarPeekState } from './useSidebarPeekState';
import { useSidebarRailResize } from './useSidebarRailResize';

/* * */

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

	const {
		isPeekAnimating,
		labelsVisible,
		peekExpanded,
		peekOverlayRef,
		setIsHovering,
		showToggle,
		visualMode,
	} = useSidebarPeekState({ collapsed });

	const { railRef, resizing, setResizing } = useSidebarRailResize({ onWidthPxChange });

	const layoutWidthPx = collapsed ? SIDEBAR_COLLAPSED_WIDTH : widthPx;

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
							className={panelStyles.sidebarPanel}
							data-peek-expanded={peekExpanded}
							style={collapsed ? {
								'--sidebar-peek-width-collapsed': `${SIDEBAR_COLLAPSED_WIDTH}px`,
								'--sidebar-peek-width-expanded': `${widthPx}px`,
							} as CSSProperties : undefined}
							data-sidebar-panel
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
