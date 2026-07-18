'use client';

import { type CSSProperties, useCallback } from 'react';

import styles from './styles.module.css';

import { Surface } from '../../layout/Surface';
import { SIDEBAR_LOGO_WIDTH_PX } from '../sidebar-layout.constants';
import { useSidebarContext } from '../Sidebar.context';
import { SidebarFooter } from '../SidebarFooter';
import { SidebarHeader } from '../SidebarHeader';
import { SidebarPanel } from '../SidebarPanel';

/* * */

export function SidebarMain() {
	//

	//
	// A. Setup variables

	const sidebarContext = useSidebarContext();

	//
	// B. Handle actions

	const handleStartHovering = useCallback(() => {
		sidebarContext.presentation.setVisualMode('hovered');
	}, [sidebarContext]);

	const handleStopHovering = useCallback(() => {
		sidebarContext.presentation.setVisualMode('collapsed');
	}, [sidebarContext]);

	//
	// C. Render components

	return (
		<div
			className={styles.fixedContainer}
			data-visual-mode={sidebarContext.presentation.visual_mode}
			onMouseEnter={handleStartHovering}
			onMouseLeave={handleStopHovering}
			onTouchEnd={handleStopHovering}
			onTouchStart={handleStartHovering}
			style={{ '--sidebar-width-collapsed': SIDEBAR_LOGO_WIDTH_PX } as CSSProperties}
		>
			<div className={styles.expandingContainer}>
				<Surface>

					<SidebarHeader />

					<SidebarPanel />

					<SidebarFooter
						iconOnly={sidebarContext.presentation.visual_mode !== 'collapsed'}
						menuPosition={sidebarContext.presentation.visual_mode !== 'collapsed' ? 'bottom-end' : 'right-start'}
					/>

				</Surface>
			</div>
		</div>
	);
}
