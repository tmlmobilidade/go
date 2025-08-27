'use client';

/* * */

import { RealtimeDetailHeader } from '@/components/realtime/detail/RealtimeDetailHeader';
import { RealtimeSectionTripDetails } from '@/components/realtime/detail/RealtimeSectionTripDetails';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function RealtimeDetail() {
	return (
		<Pane header={[<RealtimeDetailHeader />]}>
			<RealtimeSectionTripDetails />
		</Pane>
	);
}
