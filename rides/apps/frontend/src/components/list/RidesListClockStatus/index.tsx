'use client';

/* * */

import { useRidesListContext } from '@/contexts/RidesList.context';
import { Button } from '@tmlmobilidade/ui';

/* * */

export function RidesListClockStatus() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesListContext();

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
