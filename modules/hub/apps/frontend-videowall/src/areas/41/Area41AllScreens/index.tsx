'use client';

/* * */

import { Area41Screen1 } from '@/areas/41/Area41Screen1';
import { Area41Screen2 } from '@/areas/41/Area41Screen2';
import { Area41Screen3 } from '@/areas/41/Area41Screen3';
import { Area41Screen4 } from '@/areas/41/Area41Screen4';

import styles from '@/areas/cm/AreaCmAllScreens/styles.module.css';

/* * */

export function Area41AllScreens() {
	return (
		<div className={styles.container}>
			<Area41Screen1 />
			<Area41Screen2 />
			<Area41Screen3 />
			<Area41Screen4 />
		</div>
	);
}
