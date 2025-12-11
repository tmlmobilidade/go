'use client';

/* * */

import { ScheduledAlertCreateHeader } from '@/components/scheduled/create/ScheduledAlertCreateHeader';
import { ScheduledAlertCreateSectionCauseEffect } from '@/components/scheduled/create/ScheduledAlertCreateSectionCauseEffect';
import { ScheduledAlertCreateSectionTitle } from '@/components/scheduled/create/ScheduledAlertCreateSectionTitle';
import { ScheduledAlertCreateSectionValidity } from '@/components/scheduled/create/ScheduledAlertCreateSectionValidity';
import { Divider, Pane } from '@tmlmobilidade/ui';

/* * */

export function ScheduledAlertCreate() {
	return (
		<Pane header={[<ScheduledAlertCreateHeader />]}>
			<ScheduledAlertCreateSectionTitle />
			<Divider />
			<ScheduledAlertCreateSectionValidity />
			<Divider />
			<ScheduledAlertCreateSectionCauseEffect />
		</Pane>
	);
}
