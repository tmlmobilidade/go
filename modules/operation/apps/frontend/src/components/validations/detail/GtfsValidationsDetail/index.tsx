'use client';

import { GtfsValidationsDetailHeader } from '@/components/validations/detail/GtfsValidationsDetailHeader';
import { GtfsValidationsDetailSectionResult } from '@/components/validations/detail/GtfsValidationsDetailSectionResult';
import { ValidationsDetailFootnote } from '@/components/validations/detail/ValidationsDetailFootnote';
import { useValidationsDetailContext } from '@/components/validations/detail/ValidationsDetailForm.context';
import { ValidationsDetailSectionAgency } from '@/components/validations/detail/ValidationsDetailSectionAgency';
import { ValidationsDetailSectionFeedInfo } from '@/components/validations/detail/ValidationsDetailSectionFeedInfo';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

/* * */

export function GtfsValidationsDetail() {
	//

	//
	// A. Setup variables

	const validationsDetailContext = useValidationsDetailContext();

	//
	// B. Render components

	if (validationsDetailContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (validationsDetailContext.flags.error) {
		return <ErrorDisplay message={validationsDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<GtfsValidationsDetailHeader key="header" />]}>
			<ValidationsDetailSectionAgency />
			<ValidationsDetailSectionFeedInfo />
			<GtfsValidationsDetailSectionResult />
			<ValidationsDetailFootnote />
		</Pane>
	);
}
