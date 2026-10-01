'use client';

/* * */

import { Area43Screen1 } from '@/areas/43/Area43Screen1';
import { Area43Screen2 } from '@/areas/43/Area43Screen2';
import { Area43Screen3 } from '@/areas/43/Area43Screen3';
import { Area43Screen4 } from '@/areas/43/Area43Screen4';

import styles from '@/areas/cm/AreaCmAllScreens/styles.module.css';

/* * */

export function Area43AllScreens() {
	return (
		<div className={styles.container}>
			<Area43Screen1 />
			<Area43Screen2 />
			<Area43Screen3 />
			<Area43Screen4 />
		</div>
	);
}
