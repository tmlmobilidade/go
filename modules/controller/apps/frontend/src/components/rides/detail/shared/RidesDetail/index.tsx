'use client';

import { RideAcceptance } from '@/components/rides/detail/acceptance/RideAcceptance';
import { RideAnalysisAnalysis } from '@/components/rides/detail/analysis/RideAnalysis';
import { RideAnalysisViewNavigation } from '@/components/rides/detail/analysis/RideAnalysisViewNavigation';
import { RideAnalysisAudit } from '@/components/rides/detail/audit';
import { RidesDetailHeader } from '@/components/rides/detail/shared/RidesDetailHeader';
import { useRidesDetailRideData } from '@/components/rides/detail/shared/use-rides-detail-ride-data';
import { useRidesDetailCurrentView } from '@/components/rides/detail/shared/use-rides-detail-view';
import { LoadingOverlay, Pane } from '@tmlmobilidade/ui';

import { useRidesDetailRideAnalysesData } from '../use-rides-detail-ride-analyses-data';

/* * */

export function RidesDetail() {
	//

	//
	// A. Setup variables

	const { currentView } = useRidesDetailCurrentView();

	const { error: rideError, isLoading: rideIsLoading } = useRidesDetailRideData();
	const { error: rideAnalysesError, isLoading: rideAnalysesIsLoading } = useRidesDetailRideAnalysesData();

	//
	// B. Render components

	if (rideIsLoading || rideAnalysesIsLoading) {
		return <LoadingOverlay />;
	}

	return (
		<Pane header={[
			<RidesDetailHeader key="header" />,
			<RideAnalysisViewNavigation key="navigation" />,
		]}
		>
			{/* {error && <ErrorDisplay message={error} />} */}
			{rideError && <pre>{JSON.stringify(rideError, null, 2)}</pre>}
			{rideAnalysesError && <pre>{JSON.stringify(rideAnalysesError, null, 2)}</pre>}
			{currentView === 'analysis' && <RideAnalysisAnalysis />}
			{currentView === 'audit' && <RideAnalysisAudit />}
			{currentView === 'acceptance' && <RideAcceptance />}
		</Pane>
	);
}
