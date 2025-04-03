'use client';

/* * */

import { MapOptionsContextProvider } from '@/contexts/MapOptions.context';
import { OperationalDateContextProvider } from '@/contexts/OperationalDate.context';
import { RidesContextProvider } from '@/contexts/Rides.context';
import { MapProvider } from '@vis.gl/react-maplibre';
import { PropsWithChildren } from 'react';
import { SWRConfig, type SWRConfiguration } from 'swr';

/* * */

export function Providers({ children }: PropsWithChildren) {
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
		<SWRConfig value={swrSettings}>
			<OperationalDateContextProvider>
				<RidesContextProvider>
					<MapOptionsContextProvider>
						<MapProvider>
							{children}
						</MapProvider>
					</MapOptionsContextProvider>
				</RidesContextProvider>
			</OperationalDateContextProvider>
		</SWRConfig>
	);

	//
}
