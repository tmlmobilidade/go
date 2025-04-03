'use client';

/* * */

import { useRidesDetailContext } from '@/contexts/RidesDetail.context';
import { IconRefreshDot } from '@tabler/icons-react';
import { Button, Spacer, Tag } from '@tmlmobilidade/ui';

/* * */

export function RidesDetailHeader() {
	//

	//
	// A. Setup variables

	const ridesDetailContext = useRidesDetailContext();

	//
	// B. Render components

	return (
		<>
			<Tag label={ridesDetailContext.data.ride_id} variant="muted" />
			<Spacer />
			<Button icon={<IconRefreshDot />} label="Reprocessar" />
		</>
	);

	//
}
