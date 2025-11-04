'use client';

/* * */

import AreasHome from '@/components/layout/AreasHome';
import { OPERATORS } from '@/constants';

import styles from './styles.module.css';

/* * */

export default function Page() {
	return (
		<div className={styles.container}>
			<AreasHome operator={OPERATORS.AREA_1} />
			<AreasHome operator={OPERATORS.AREA_2} />
		</div>
	);
}
