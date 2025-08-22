'use client';

/* * */

import { AgenciesContextProvider } from '@/contexts/Agencies.context';
import { MapProvider } from '@vis.gl/react-maplibre';
import { PropsWithChildren } from 'react';
import { SWRConfig, type SWRConfiguration } from 'swr';

/* * */

export function DataProviders({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const swrSettings: SWRConfiguration = {
		fetcher: async (url: string) => {
			const res = await fetch(url, { credentials: 'include' });
			const data = await res.json();
			if (!res.ok) throw new Error(data.message);
			return data;
		},
		refreshInterval: 900000, // 15 minutes
		revalidateOnFocus: true,
		revalidateOnMount: true,
	};

	//
	// B. Render components

	return (
		<SWRConfig value={swrSettings}>
			<AgenciesContextProvider>
				<MapProvider>
					{children}
				</MapProvider>
			</AgenciesContextProvider>
		</SWRConfig>
	);

	//
}
