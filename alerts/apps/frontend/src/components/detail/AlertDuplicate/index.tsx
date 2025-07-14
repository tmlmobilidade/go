'use client';

import { AlertDetailSectionCauseEffect } from '@/components/detail/AlertDetailSectionCauseEffect';
import { AlertDetailSectionReferences } from '@/components/detail/AlertDetailSectionReferences';
import { AlertDetailSectionTitle } from '@/components/detail/AlertDetailSectionTitle';
import { AlertDetailSectionValidity } from '@/components/detail/AlertDetailSectionValidity';
import { AlertDetailSectionVisibility } from '@/components/detail/AlertDetailSectionVisibility';
import { AlertDetailContextProvider } from '@/contexts/AlertDetail.context';
import { Pane } from '@tmlmobilidade/ui';

import { AlertDetailHeader } from '../AlertDetailHeader';

/* * */

export default function AlertDuplicate({ id }: { id: string }) {
	//
	// A. Render components
	return (

		<AlertDetailContextProvider alertId={id}>
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
		</AlertDetailContextProvider>
	);
};
