'use client';

/* * */

import { RidesListUpdatedAt } from '@/components/RidesListUpdatedAt';
import { Label, Spacer } from '@tmlmobilidade/ui';

/* * */

export function RidesListHeader() {
	return (
		<>
			<Label size="lg" caps>Monitorização</Label>
			<Spacer />
			<RidesListUpdatedAt />
		</>
	);
}
