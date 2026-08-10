'use client';

import { RideAcceptance } from '@/components/rides/acceptance/RideAcceptance';
import { RideAnalysisAnalysis } from '@/components/rides/analysis/RideAnalysis';
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

	const rideAnalysisContext = useRideAnalysisContext();

	//
	// B. Render components

	if (rideAnalysisContext.flags.loading) {
		return <LoadingOverlay />;
	}

	return (
		<Pane header={[
			<RidesDetailHeader key="header" />,
			<RideAnalysisViewNavigation key="navigation" />,
		]}
		>
			{rideAnalysisContext.flags.error && <ErrorDisplay message={rideAnalysisContext.flags.error.message} />}
			{rideAnalysisContext.data.selected_view === 'ANALYSIS' && <RideAnalysisAnalysis />}
			{rideAnalysisContext.data.selected_view === 'AUDIT' && <RideAnalysisAudit />}
			{rideAnalysisContext.data.selected_view === 'ACCEPTANCE' && <RideAcceptance />}
		</Pane>
	);

	//
}
