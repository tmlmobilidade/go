'use client';

/* * */

import { RidesListUpdatedAt } from '@/components/list/RidesListUpdatedAt';
import { Label, Spacer } from '@tmlmobilidade/ui';

/* * */

export function RidesListHeader() {
	return (
		<>
			<Label size="lg" caps>SLAs</Label>
			<Spacer />
			<RidesListUpdatedAt />
		</>
	);
}
