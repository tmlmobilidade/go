'use client';

import { useSchoolDetailContext } from '@/components/schools/detail/SchoolDetail.context';
import { SchoolDetailHeader } from '@/components/schools/detail/SchoolDetailHeader';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

/* * */

export function SchoolDetail() {
	//

	//
	// A. Setup variables

	const schoolDetailContext = useSchoolDetailContext();

	//
	// B. Render components

	if (schoolDetailContext.flags.isLoading) {
		return <LoadingOverlay />;
	}

	if (schoolDetailContext.flags.error) {
		return <ErrorDisplay message={schoolDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<SchoolDetailHeader key="header" />]}>
			<p>NO SECTIONS YET</p>
		</Pane>
	);
}
