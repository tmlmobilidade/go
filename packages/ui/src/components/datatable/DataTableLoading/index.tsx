'use client';

import styles from './styles.module.css';

import { Loader } from '../../loaders';

/* * */

export function DataTableLoading() {
	return (
		<div className={styles.root}>
			<Loader size="lg" />
		</div>
	);
}
