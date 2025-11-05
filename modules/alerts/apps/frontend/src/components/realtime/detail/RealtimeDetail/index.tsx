'use client';

/* * */

import { RealtimeDetailHeader } from '@/components/realtime/detail/RealtimeDetailHeader';
import { RealtimeDetailSectionCauseEffect } from '@/components/realtime/detail/RealtimeDetailSectionCauseEffect';
import { RealtimeDetailSectionReferences } from '@/components/realtime/detail/RealtimeDetailSectionReferences';
import { RealtimeDetailSectionTitle } from '@/components/realtime/detail/RealtimeDetailSectionTitle';
import { RealtimeDetailSectionValidity } from '@/components/realtime/detail/RealtimeDetailSectionValidity';
import { RealtimeDetailSectionVisibility } from '@/components/realtime/detail/RealtimeDetailSectionVisibility';
import { Pane } from '@go/ui';

/* * */

export function RealtimeDetail() {
	return (
		<Pane header={[<RealtimeDetailHeader />]}>
			{/* Title & Description */}
			<RealtimeDetailSectionTitle />
			{/* Visibility Scheduling */}
			<RealtimeDetailSectionVisibility />
			{/* Validity Scheduling */}
			<RealtimeDetailSectionValidity />
			{/* Cause & Effect */}
			<RealtimeDetailSectionCauseEffect />
			{/* References */}
			<RealtimeDetailSectionReferences />
		</Pane>
	);
}
