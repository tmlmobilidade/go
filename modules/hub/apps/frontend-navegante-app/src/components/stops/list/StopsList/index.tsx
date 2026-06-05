'use client';

import { StopsListContextProvider } from '@/components/stops/list/StopsList.context';
import { StopsListView } from '@/components/stops/list/StopsListView';

import styles from './styles.module.css';

/* * */

export function StopsList() {
	return (
		<StopsListContextProvider>
			<div className={styles.container}>
				<StopsListView />
			</div>
		</StopsListContextProvider>
	);
}
