'use client';

/* * */

import Navigation from '@/components/Navigation';
import Stop from '@/components/Stop';

/* * */

import { StopDetailContextProvider } from '@/contexts/StopDetail.context';
import { StopsListContextProvider } from '@/contexts/StopsList.context';

import styles from './styles.module.css';
import { SearchbarContextProvider } from '@/contexts/Searchbar.context';

/* * */

export default function Page() {
	//
	// A. Setup variables

	//
	// B. Render components

	return (
		<div className={styles.container}>
			<StopsListContextProvider>
				<SearchbarContextProvider>
					<Navigation />
				</SearchbarContextProvider>
			</StopsListContextProvider>
			<StopDetailContextProvider stopId={null}>
				<Stop paramId={null} />
			</StopDetailContextProvider>
		</div>
	);
}
