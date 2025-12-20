'use client';

/* * */

import { ScheduledDetailHeader } from '@/components/scheduled/detail/ScheduledDetailHeader';
import { ScheduledDetailSectionCauseEffect } from '@/components/scheduled/detail/ScheduledDetailSectionCauseEffect';
import { ScheduledDetailSectionReferences } from '@/components/scheduled/detail/ScheduledDetailSectionReferences';
import { ScheduledDetailSectionTitle } from '@/components/scheduled/detail/ScheduledDetailSectionTitle';
import { ScheduledDetailSectionValidity } from '@/components/scheduled/detail/ScheduledDetailSectionValidity';
import { ScheduledDetailSectionVisibility } from '@/components/scheduled/detail/ScheduledDetailSectionVisibility';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function ScheduledDetail() {
	return (
		<Pane header={[<ScheduledDetailHeader />]}>
			<ScheduledDetailSectionReferences />
			<ScheduledDetailSectionTitle />
			<ScheduledDetailSectionVisibility />
			<ScheduledDetailSectionValidity />
			<ScheduledDetailSectionCauseEffect />
		</Pane>
	);
}
