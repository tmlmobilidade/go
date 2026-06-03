'use client';

import { MapProvider } from '@vis.gl/react-maplibre';
import { type PropsWithChildren } from 'react';

/* * */

export function MapProviders({ children }: PropsWithChildren) {
	return (
		<MapProvider>
			{children}
		</MapProvider>
	);
}
