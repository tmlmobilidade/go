'use client';

import { RideAcceptance } from '@/components/rides/detail/acceptance/RideAcceptance';
import { RideAnalysisAnalysis } from '@/components/rides/detail/analysis/RideAnalysis';
import { RideAnalysisViewNavigation } from '@/components/rides/detail/analysis/RideAnalysisViewNavigation';
import { RideAnalysisAudit } from '@/components/rides/detail/audit';
import { RidesDetailHeader } from '@/components/rides/detail/shared/RidesDetailHeader';
import { useRidesDetailRideData } from '@/components/rides/detail/shared/use-rides-detail-ride-data';
import { useRidesDetailCurrentView } from '@/components/rides/detail/shared/use-rides-detail-view';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

/* * */

export function RidesDetail() {
	//

	//
	// A. Setup variables

	const { currentView } = useRidesDetailCurrentView();
	const { error, isLoading } = useRidesDetailRideData();

	//
	// B. Render components

	if (isLoading) {
		return <LoadingOverlay />;
	}

	return (
		<Pane header={[
			<RidesDetailHeader key="header" />,
			<RideAnalysisViewNavigation key="navigation" />,
		]}
		>
			{error && <ErrorDisplay message={error} />}
			{currentView === 'analysis' && <RideAnalysisAnalysis />}
			{currentView === 'audit' && <RideAnalysisAudit />}
			{currentView === 'acceptance' && <RideAcceptance />}
		</Pane>
	);
}
