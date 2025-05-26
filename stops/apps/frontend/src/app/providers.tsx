'use client';

import { LinesContextProvider } from '@/contexts/Lines.context';
/* * */

import { MapOptionsContextProvider } from '@/contexts/MapOptions.context';
import { StopsContextProvider } from '@/contexts/Stops.context';
import { MapProvider } from '@vis.gl/react-maplibre';
import { PropsWithChildren } from 'react';
import { SWRConfig, type SWRConfiguration } from 'swr';

/* * */

export function Providers({ children }: PropsWithChildren) {
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
			<StopsContextProvider>
				<LinesContextProvider>
					<MapOptionsContextProvider>
						<MapProvider>
							{children}
						</MapProvider>
					</MapOptionsContextProvider>
				</LinesContextProvider>
			</StopsContextProvider>
		</SWRConfig>
	);

	//
}
