'use client';

/* * */

import { AlertDetailHeader } from '@/components/scheduled/detail/AlertDetailHeader';
import { AlertDetailSectionCauseEffect } from '@/components/scheduled/detail/AlertDetailSectionCauseEffect';
import { AlertDetailSectionReferences } from '@/components/scheduled/detail/AlertDetailSectionReferences';
import { AlertDetailSectionTitle } from '@/components/scheduled/detail/AlertDetailSectionTitle';
import { AlertDetailSectionValidity } from '@/components/scheduled/detail/AlertDetailSectionValidity';
import { AlertDetailSectionVisibility } from '@/components/scheduled/detail/AlertDetailSectionVisibility';
import { Pane } from '@go/ui';

/* * */

export function AlertDetail() {
	return (
		<Pane header={[<AlertDetailHeader />]}>
			{/* Title & Description */}
			<AlertDetailSectionTitle />
			{/* Visibility Scheduling */}
			<AlertDetailSectionVisibility />
			{/* Validity Scheduling */}
			<AlertDetailSectionValidity />
			{/* Cause & Effect */}
			<AlertDetailSectionCauseEffect />
			{/* References */}
			<AlertDetailSectionReferences />
		</Pane>
	);
}
