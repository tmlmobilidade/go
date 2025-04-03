'use client';

/* * */

import { useRidesCatalogContext } from '@/contexts/RidesCatalog.context';
import { Button } from '@tmlmobilidade/ui';

/* * */

export function RidesCatalogClockStatus() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesCatalogContext();

	//
	// B. Render components

	return (
		<Button
			label={ridesListContext.data.is_locked ? 'Agora' : 'Ir para agora'}
			onClick={() => ridesListContext.actions.setLockStatus()}
			variant={ridesListContext.data.is_locked ? 'danger' : 'muted'}
		/>
	);

	//
}
