'use client';

/* * */

import { ValidationDetailFootnote } from '@/components/validations/detail/ValidationDetailFootnote';
import { ValidationDetailHeader } from '@/components/validations/detail/ValidationDetailHeader';
import { ValidationDetailSectionAgency } from '@/components/validations/detail/ValidationDetailSectionAgency';
import { ValidationDetailSectionFeedInfo } from '@/components/validations/detail/ValidationDetailSectionFeedInfo';
import { ValidationDetailSectionResult } from '@/components/validations/detail/ValidationDetailSectionResult';
import { useValidationDetailContext } from '@/contexts/ValidationDetail.context';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

/* * */

export function ValidationDetail() {
	//

	//
	// A. Setup variables

	const validationDetailContext = useValidationDetailContext();

	//
	// B. Render components

	if (validationDetailContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (validationDetailContext.flags.error) {
		return <ErrorDisplay message={validationDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<ValidationDetailHeader />]}>
			<ValidationDetailSectionAgency />
			<ValidationDetailSectionFeedInfo />
			<ValidationDetailSectionResult />
			<ValidationDetailFootnote />
		</Pane>
	);

	//
}
