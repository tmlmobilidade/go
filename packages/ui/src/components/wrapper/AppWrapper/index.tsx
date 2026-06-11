'use client';

import { type PropsWithChildren } from 'react';

import styles from './styles.module.css';

import { useLayoutContext } from '../../../contexts/Layout.context';
import { useUserPreference } from '../../../hooks/use-user-preference';
import { Sidebar } from '../../sidebar/Sidebar';
import { clampSidebarRailWidth, SIDEBAR_RAIL_WIDTH_DEFAULT } from '../../sidebar/sidebar-rail-width';

/* * */

export function AppWrapper({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const layoutContext = useLayoutContext();

	const [sidebarHidden, setSidebarHidden] = useUserPreference<boolean>('ui', 'sidebar_hidden', false);
	const [sidebarWidthPref, setSidebarWidthPref] = useUserPreference<number>('ui', 'sidebar_width_px', SIDEBAR_RAIL_WIDTH_DEFAULT);

	const sidebarWidthPx = clampSidebarRailWidth(sidebarWidthPref);

	const handleSidebarWidthChange = (widthPx: number) => {
		setSidebarWidthPref(clampSidebarRailWidth(widthPx));
	};

	//
	// B. Render components

	if (layoutContext.data.active_fullscreen) {
		return (
			<div className={styles.container}>
				<div className={styles.content}>{children}</div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<Sidebar
				collapsed={sidebarHidden}
				onCollapsedChange={setSidebarHidden}
				onWidthPxChange={handleSidebarWidthChange}
				widthPx={sidebarWidthPx}
			/>
			<div className={styles.content}>{children}</div>
		</div>
	);

	//
}
