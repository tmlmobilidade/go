'use client';

/* * */

import { LocationsPage } from '@/components/locations/LocationsPage';
import { LocationsContextProvider } from '@/contexts/Locations.context';

/* * */

export default function Page() {
	//

	//
	// A. Render components

	return (
		<LocationsContextProvider>
			<LocationsPage />
		</LocationsContextProvider>
	);

	//
}
