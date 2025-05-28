'use client';

import { Navigation } from '@/components/Navigation';
import Stop from '@/components/Stop';
import { SearchbarContextProvider } from '@/contexts/Searchbar.context';
import { StopsDetailContextProvider } from '@/contexts/StopsDetail.context';
import { StopsListContextProvider } from '@/contexts/StopsList.context';

import styles from './styles.module.css';
import { PanesManager } from '@tmlmobilidade/ui';

/* * */

export default function Page() {
	//
	// A. Setup variables

	//
	// B. Render components

	return (
		<PanesManager
			panes={[
				<div className={styles.container}>
					<StopsListContextProvider>
						<SearchbarContextProvider>
							<Navigation />
						</SearchbarContextProvider>
					</StopsListContextProvider>
					<StopsDetailContextProvider stopId={null}>
						<Stop paramId={null} />
					</StopsDetailContextProvider>
				</div>
			]}
		/>

	);
}
