'use client';
/* * */

import { GlobalSettingsContextProvider } from '@/contexts/GlobalSettings.context';
import { Suspense } from 'react';
import { SWRConfig, type SWRConfiguration } from 'swr';

/* * */

export function ConfigProviders({ children }) {
	//

	//
	// A. Setup variables

	const swrSettings: SWRConfiguration = {
		async fetcher(...args: Parameters<typeof fetch>) {
			const res = await fetch(...args);
			if (!res.ok) {
				const errorDetails = await res.json();
				const error = new Error(errorDetails.message || 'An error occurred while fetching data.');
				const customError = {
					...error,
					description: errorDetails.description || 'No additional information was provided by the API.',
					status: res.status,
				};
				throw customError;
			}
			return res.json();
		},
		refreshInterval: 900000, // 15 minutes
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
