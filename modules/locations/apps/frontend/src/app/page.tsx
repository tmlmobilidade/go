'use client';

import { LocationsPage } from '@/components/locations/LocationsPage';
import { LocationsContextProvider } from '@/contexts/Locations.context';

/* * */

export default function Page() {
	return (
		<LocationsContextProvider>
			<LocationsPage />
		</LocationsContextProvider>
	);
}
