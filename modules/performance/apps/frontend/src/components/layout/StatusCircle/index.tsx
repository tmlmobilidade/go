/* * */

import { type SystemStatusType } from '@/constants';

import styles from './styles.module.css';

/* * */

export function StatusCircle({ status }: { status: SystemStatusType }) {
	//

	// A. Render components

	return (
		<span className={`${styles.statusCircle} ${styles[status]}`} />
	);
}

//
