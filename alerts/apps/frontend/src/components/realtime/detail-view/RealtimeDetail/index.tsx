'use client';

/* * */

import { RealtimeDetailHeader } from '@/components/realtime/detail-view/RealtimeDetailHeader';
import { RealtimeDetailSectionCauseEffect } from '@/components/realtime/detail-view/RealtimeDetailSectionCauseEffect';
import { RealtimeDetailSectionReferences } from '@/components/realtime/detail-view/RealtimeDetailSectionReferences';
import { RealtimeDetailSectionTitle } from '@/components/realtime/detail-view/RealtimeDetailSectionTitle';
import { RealtimeDetailSectionValidity } from '@/components/realtime/detail-view/RealtimeDetailSectionValidity';
import { RealtimeDetailSectionVisibility } from '@/components/realtime/detail-view/RealtimeDetailSectionVisibility';
import { Pane } from '@tmlmobilidade/ui';

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
