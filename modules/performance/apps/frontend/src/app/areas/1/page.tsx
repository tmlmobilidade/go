'use client';

import AreasHome from '@/components/layout/AreasHome';
import { AGENCIES } from '@/constants';

import styles from './styles.module.css';

/* * */

export default function Page() {
	return (
		<div className={styles.container}>
			<AreasHome agency={AGENCIES.AREA_1} />
			<AreasHome agency={AGENCIES.AREA_2} />
		</div>
	);
}
