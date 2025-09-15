'use client';

/* * */

import { RidesDetailHeader } from '@/components/rides/detail/RidesDetailHeader';
import { RidesDetailViewNavigation } from '@/components/rides/detail/RidesDetailViewNavigation';
import { useRidesDetailContext } from '@/contexts/RidesDetail.context';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

import { RidesDetailAnalysis } from '../analysis';
import { RidesDetailAudit } from '../audit';
import { RidesDetailJustification } from '../justification';

/* * */

export function RidesDetail() {
	//

	//
	// A. Setup variables

	const ridesDetailContext = useRidesDetailContext();

	//
	// B. Render components

	if (ridesDetailContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (ridesDetailContext.flags.error) {
		return <ErrorDisplay message={ridesDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<RidesDetailHeader />, <RidesDetailViewNavigation />]}>
			{ridesDetailContext.data.selected_view === 'ANALYSIS' && <RidesDetailAnalysis />}
			{ridesDetailContext.data.selected_view === 'AUDIT' && <RidesDetailAudit />}
			{ridesDetailContext.data.selected_view === 'JUSTIFICATIONS' && <RidesDetailJustification />}
		</Pane>
	);

	//
}
