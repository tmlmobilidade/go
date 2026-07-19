'use client';

import styles from './styles.module.css';

import { useSidebarContext } from '../Sidebar.context';

/* * */

export function SidebarBackdrop() {
	//

	//
	// A. Setup variables

	const sidebarContext = useSidebarContext();

	//
	// B. Render components

	return (
		<div
			className={styles.backdrop}
			data-is-visible={sidebarContext.presentation.visual_mode === 'hovered'}
		/>
	);
}
