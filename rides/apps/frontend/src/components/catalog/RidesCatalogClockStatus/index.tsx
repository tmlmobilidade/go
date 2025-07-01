'use client';

/* * */

import { useRidesCatalogContext } from '@/contexts/RidesCatalog.context';
import { Button } from '@tmlmobilidade/ui';

/* * */

export function RidesCatalogClockStatus() {
	//

	//
	// A. Setup variables

	const ridesCatalogContext = useRidesCatalogContext();

	//
	// B. Render components

	return (
		<Button
			label={ridesCatalogContext.data.is_locked ? 'Agora' : 'Ir para agora'}
			onClick={() => ridesCatalogContext.actions.setLockStatus()}
			variant={ridesCatalogContext.data.is_locked ? 'danger' : 'muted'}
		/>
	);

	//
}
