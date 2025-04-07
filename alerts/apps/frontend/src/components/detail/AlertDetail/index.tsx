'use client';

/* * */

import { AlertDetailHeader } from '@/components/detail/AlertDetailHeader';
import { AlertDetailSectionCauseEffect } from '@/components/detail/AlertDetailSectionCauseEffect';
import { AlertDetailSectionReferences } from '@/components/detail/AlertDetailSectionReferences';
import { AlertDetailSectionTitle } from '@/components/detail/AlertDetailSectionTitle';
import { AlertDetailSectionValidity } from '@/components/detail/AlertDetailSectionValidity';
import { AlertDetailSectionVisibility } from '@/components/detail/AlertDetailSectionVisibility';
import { Pane } from '@tmlmobilidade/ui';

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
