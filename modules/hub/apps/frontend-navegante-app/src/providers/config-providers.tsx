'use client';
/* * */

import { GlobalSettingsContextProvider } from '@/contexts/GlobalSettings.context';
import { swrFetcher } from '@tmlmobilidade/utils';
import { Suspense } from 'react';
import { SWRConfig, type SWRConfiguration } from 'swr';

/* * */

export function ConfigProviders({ children }) {
	//

	//
	// A. Setup variables

	const swrSettings: SWRConfiguration = {
		fetcher: swrFetcher,
		refreshInterval: 600_000, // 10 minutes
		refreshWhenHidden: true,
		revalidateIfStale: true,
		revalidateOnFocus: true,
		revalidateOnMount: true,
	};

	//
	// B. Render components

	return (
		<Suspense fallback={<div>Loading configuration...</div>}>
			<SWRConfig value={swrSettings}>
				<GlobalSettingsContextProvider>
					{children}
				</GlobalSettingsContextProvider>
			</SWRConfig>
		</Suspense>
	);

	//
}
