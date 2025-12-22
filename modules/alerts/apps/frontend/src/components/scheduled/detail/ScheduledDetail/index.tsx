'use client';

/* * */

import { useScheduledDetailContext } from '@/components/scheduled/detail/ScheduledDetail.context';
import { ScheduledDetailHeader } from '@/components/scheduled/detail/ScheduledDetailHeader';
import { ScheduledDetailSectionCauseEffect } from '@/components/scheduled/detail/ScheduledDetailSectionCauseEffect';
import { ScheduledDetailSectionReferences } from '@/components/scheduled/detail/ScheduledDetailSectionReferences';
import { ScheduledDetailSectionTitle } from '@/components/scheduled/detail/ScheduledDetailSectionTitle';
import { ScheduledDetailSectionValidity } from '@/components/scheduled/detail/ScheduledDetailSectionValidity';
import { ScheduledDetailSectionVisibility } from '@/components/scheduled/detail/ScheduledDetailSectionVisibility';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

/* * */

export function ScheduledDetail() {
	//

	//
	// A. Setup variables

	const scheduledDetailContext = useScheduledDetailContext();

	//
	// B. Render components

	if (scheduledDetailContext.flags.isLoading) {
		return <LoadingOverlay />;
	}

	if (scheduledDetailContext.flags.error) {
		return <ErrorDisplay message={scheduledDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<ScheduledDetailHeader />]}>
			<ScheduledDetailSectionTitle />
			<ScheduledDetailSectionVisibility />
			<ScheduledDetailSectionValidity />
			<ScheduledDetailSectionCauseEffect />
			<ScheduledDetailSectionReferences />
		</Pane>
	);
}
