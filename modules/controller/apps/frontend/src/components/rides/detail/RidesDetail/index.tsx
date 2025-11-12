'use client';

/* * */

import { RideAcceptance } from '@/components/rides/acceptance';
import { RideAnalysisAnalysis } from '@/components/rides/analysis';
import { RideAnalysisViewNavigation } from '@/components/rides/analysis/RideAnalysisViewNavigation';
import { RideAnalysisAudit } from '@/components/rides/audit';
import { RidesDetailHeader } from '@/components/rides/detail/RidesDetailHeader';
import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

/* * */

export function RidesDetail() {
	//

	//
	// A. Setup variables

	const RideAnalysisContext = useRideAnalysisContext();

	//
	// B. Render components

	if (RideAnalysisContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (RideAnalysisContext.flags.error) {
		return <ErrorDisplay message={RideAnalysisContext.flags.error.message} />;
	}

	return (
		<Pane header={[<RidesDetailHeader />, <RideAnalysisViewNavigation />]}>
			{RideAnalysisContext.data.selected_view === 'ANALYSIS' && <RideAnalysisAnalysis />}
			{RideAnalysisContext.data.selected_view === 'AUDIT' && <RideAnalysisAudit />}
			{RideAnalysisContext.data.selected_view === 'ACCEPTANCE' && <RideAcceptance />}
		</Pane>
	);

	//
}
