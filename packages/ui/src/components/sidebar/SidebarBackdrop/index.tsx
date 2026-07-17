'use client';

import styles from './styles.module.css';

/* * */

export interface SidebarBackdropProps {
	isVisible: boolean
}

/* * */

export function SidebarBackdrop({ isVisible }: SidebarBackdropProps) {
	return (
		<div
			className={styles.backdrop}
			data-is-visible={isVisible}
		/>
	);
}
