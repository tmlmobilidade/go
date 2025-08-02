'use client';

/* * */

import { RidesListUpdatedAt } from '@/components/list/RidesListUpdatedAt';
import { useRidesListContext } from '@/contexts/RidesList.context';
import { Button, Label, Spacer } from '@tmlmobilidade/ui';

/* * */

export function RidesListHeader() {
	//

	const ridesListContext = useRidesListContext();

	return (
		<>
			<Label size="lg" caps>Circulações</Label>
			<Spacer />
			<RidesListUpdatedAt />
			<Button disabled={ridesListContext.flags.on_now} label="Center on Now" onClick={ridesListContext.actions.centerListOnNow} />
		</>
	);

	//
}
