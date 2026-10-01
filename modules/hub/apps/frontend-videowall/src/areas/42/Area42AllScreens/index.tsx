'use client';

/* * */

import { Area42Screen1 } from '@/areas/42/Area42Screen1';
import { Area42Screen2 } from '@/areas/42/Area42Screen2';
import { Area42Screen3 } from '@/areas/42/Area42Screen3';
import { Area42Screen4 } from '@/areas/42/Area42Screen4';

import styles from '@/areas/cm/AreaCmAllScreens/styles.module.css';

/* * */

export function Area42AllScreens() {
	return (
		<div className={styles.container}>
			<Area42Screen1 />
			<Area42Screen2 />
			<Area42Screen3 />
			<Area42Screen4 />
		</div>
	);
}
