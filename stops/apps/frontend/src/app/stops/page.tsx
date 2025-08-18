'use client';

/* * */

import { MapOnlyViewStops } from '@/components/Map/MapOnlyViewStops';
import { MapView } from '@/components/Map/MapView';
import { MapOptionsContextProvider } from '@/contexts/MapOptions.context';

/* * */

export default function Page() {
	return (
		<MapOptionsContextProvider>
			<MapView>
				<MapOnlyViewStops />
			</MapView>
		</MapOptionsContextProvider>
	);
}
