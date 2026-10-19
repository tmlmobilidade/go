'use client';

/* * */

import { AreaCmScreen1 } from '@/areas/cm/AreaCmScreen1';

import styles from './styles.module.css';

/* * */

export function AreaCmAllScreens() {
	return (
		<div className={`${styles.container} ${styles.containerFixed}`}>
			<AreaCmScreen1 />
		</div>
	);
}
