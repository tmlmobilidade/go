'use client';

import { type CSSProperties } from 'react';

import styles from './styles.module.css';

import { Surface } from '../../layout/Surface';
import { useSidebarContext } from '../Sidebar.context';
import { SidebarFooter } from '../SidebarFooter';
import { SidebarHeader } from '../SidebarHeader';
import { SidebarNavigation } from '../SidebarNavigation';

/* * */

export const SIDEBAR_WIDTH_COLLAPSED = 60 + 2; // 2px border
export const SIDEBAR_WIDTH_EXPANDED = 250;

/* * */

export function SidebarMain() {
	//

	//
	// A. Setup variables

	const sidebarContext = useSidebarContext();

	//
	// B. Handle actions

	const handleStartHovering = () => {
		sidebarContext.presentation.setVisualMode('hovered');
	};

	const handleStopHovering = () => {
		sidebarContext.presentation.setVisualMode('collapsed');
	};

	//
	// C. Render components

	return (
		<div
			className={styles.root}
			data-visual-mode={sidebarContext.presentation.visual_mode}
			onMouseEnter={handleStartHovering}
			onMouseLeave={handleStopHovering}
			onTouchEnd={handleStopHovering}
			onTouchStart={handleStartHovering}
			style={{
				width: sidebarContext.presentation.visual_mode === 'pinned'
					? `${SIDEBAR_WIDTH_EXPANDED}px`
					: `${SIDEBAR_WIDTH_COLLAPSED}px`,
			} as CSSProperties}
		>
			<div
				className={styles.expandingContainer}
				style={{
					width: sidebarContext.presentation.visual_mode !== 'collapsed'
						? `${SIDEBAR_WIDTH_EXPANDED}px`
						: `${SIDEBAR_WIDTH_COLLAPSED}px`,
				} as CSSProperties}
			>
				<Surface>
					<SidebarHeader />
					<SidebarNavigation />
					<SidebarFooter />
				</Surface>
			</div>
		</div>
	);
}
