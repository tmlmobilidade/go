'use client';

/* * */

import { Screen1 } from '@/areas/42/Screen1';
import { Screen2 } from '@/areas/42/Screen2';
import { Screen3 } from '@/areas/42/Screen3';
import { Screen4 } from '@/areas/42/Screen4';
// import Snowfall from 'react-snowfall';

import styles from '@/areas/cm/AllScreens/styles.module.css';

/* * */

export function AllScreens() {
	return (
		<div className={styles.container}>
			<Screen1 />
			<Screen2 />
			<Screen3 />
			<Screen4 />
			{/* <Snowfall snowflakeCount={40} speed={[0.5, 1]} wind={[0, 1]} /> */}
		</div>
	);
}
