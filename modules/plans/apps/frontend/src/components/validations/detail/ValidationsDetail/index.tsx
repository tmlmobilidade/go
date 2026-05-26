'use client';

import { ValidationsDetailFootnote } from '@/components/validations/detail/ValidationsDetailFootnote';
import { ValidationsDetailHeader } from '@/components/validations/detail/ValidationsDetailHeader';
import { ValidationsDetailSectionAgency } from '@/components/validations/detail/ValidationsDetailSectionAgency';
import { ValidationsDetailSectionFeedInfo } from '@/components/validations/detail/ValidationsDetailSectionFeedInfo';
import { ValidationsDetailSectionResult } from '@/components/validations/detail/ValidationsDetailSectionResult';
import { useValidationsDetailContext } from '@/contexts/ValidationsDetail.context';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

/* * */

export function ValidationsDetail() {
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
		<Pane header={[<ValidationsDetailHeader key="header" />]}>
			<ValidationsDetailSectionAgency />
			<ValidationsDetailSectionFeedInfo />
			<ValidationsDetailSectionResult />
			<ValidationsDetailFootnote />
		</Pane>
	);

	//
}
