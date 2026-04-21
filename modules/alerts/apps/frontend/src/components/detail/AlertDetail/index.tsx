'use client';

/* * */

import { AlertDetailHeader } from '@/components/detail/AlertDetailHeader';
import { AlertDetailSectionCauseEffect } from '@/components/detail/AlertDetailSectionCauseEffect';
import { AlertDetailSectionDates } from '@/components/detail/AlertDetailSectionDates';
import { AlertDetailSectionReferences } from '@/components/detail/AlertDetailSectionReferences';
import { AlertDetailSectionTexts } from '@/components/detail/AlertDetailSectionTexts';
import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
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
		<Pane header={[<AlertDetailHeader key="header" />]}>
			<AlertDetailSectionTexts />
			<AlertDetailSectionDates />
			<AlertDetailSectionCauseEffect />
			<AlertDetailSectionReferences />
		</Pane>
	);
}
