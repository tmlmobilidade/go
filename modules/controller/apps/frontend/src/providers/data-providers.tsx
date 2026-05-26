'use client';

import { AgenciesContextProvider } from '@/contexts/Agencies.context';
import { MapProvider } from '@vis.gl/react-maplibre';
import { type PropsWithChildren } from 'react';

/* * */

export function DataProviders({ children }: PropsWithChildren) {
	return (
		<AgenciesContextProvider>
			<MapProvider>
				{children}
			</MapProvider>
		</AgenciesContextProvider>
	);
}
