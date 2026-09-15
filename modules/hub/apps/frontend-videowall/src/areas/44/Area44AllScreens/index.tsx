'use client';

/* * */

import { Area44Screen1 } from '@/areas/44/Area44Screen1';
import { Area44Screen2 } from '@/areas/44/Area44Screen2';
import { Area44Screen3 } from '@/areas/44/Area44Screen3';
import { Area44Screen4 } from '@/areas/44/Area44Screen4';

import styles from '@/areas/cm/AreaCmAllScreens/styles.module.css';

/* * */

export function Area44AllScreens() {
	return (
		<div className={styles.container}>
			<Area44Screen1 />
			<Area44Screen2 />
			<Area44Screen3 />
			<Area44Screen4 />
		</div>
	);
}
