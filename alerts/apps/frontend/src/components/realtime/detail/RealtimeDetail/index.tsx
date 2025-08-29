'use client';

/* * */

import { RealtimeDetailHeader } from '@/components/realtime/detail/RealtimeDetailHeader';
import { useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function RealtimeDetail() {
	//
	// A. Setup variables

	const context = useRealtimeDetailContext();

	//
	// C. Render components
	return (
		<Pane header={[<RealtimeDetailHeader />]}>
			<context.data.currentStep.component />
		</Pane>
	);
}
