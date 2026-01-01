'use client';

/* * */

import { useAlertDetailContext } from '@/components/detail/AlertDetail.context';
import { AlertDetailHeader } from '@/components/detail/AlertDetailHeader';
import { AlertDetailSectionCauseEffect } from '@/components/detail/AlertDetailSectionCauseEffect';
import { AlertDetailSectionReferences } from '@/components/detail/AlertDetailSectionReferences';
import { AlertDetailSectionTitle } from '@/components/detail/AlertDetailSectionTitle';
import { AlertDetailSectionValidity } from '@/components/detail/AlertDetailSectionValidity';
import { AlertDetailSectionVisibility } from '@/components/detail/AlertDetailSectionVisibility';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

/* * */

export function AlertDetail() {
	//

	//
	// A. Setup variables

	const alertDetailContext = useAlertDetailContext();

	//
	// B. Render components

	if (alertDetailContext.flags.isLoading) {
		return <LoadingOverlay />;
	}

	if (alertDetailContext.flags.error) {
		return <ErrorDisplay message={alertDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<AlertDetailHeader />]}>
			<AlertDetailSectionTitle />
			<AlertDetailSectionVisibility />
			<AlertDetailSectionValidity />
			<AlertDetailSectionCauseEffect />
			<AlertDetailSectionReferences />
		</Pane>
	);
}
