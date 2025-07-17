'use client';

import { MapView } from '@/components/Map/MapView';
import { MapViewStops } from '@/components/Map/MapViewStops';
import { MapOptionsContextProvider } from '@/contexts/MapOptions.context';

/* * */

export default function Page() {
	return (
		<MapOptionsContextProvider>
			<MapView>
				<MapViewStops />
			</MapView>
		</MapOptionsContextProvider>
	);
}
