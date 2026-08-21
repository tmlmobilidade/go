'use client';

import { RideAcceptanceCommentList } from '@/components/rides/detail/acceptance/RideAcceptanceCommentList';
import { RideAcceptanceJustification } from '@/components/rides/detail/acceptance/RideAcceptanceJustification';
// import { RideAnalysisAnalyses, RideAnalysisResult } from '@/components/rides/detail/analysis/RideAnalysisAnalyses';
import { RideAcceptanceContextProvider, useRideAcceptanceContext } from '@/contexts/RideAcceptance.context';
import { type Ride } from '@tmlmobilidade/go-types-operation';
import { Divider, ErrorDisplay, Grid, LoadingOverlay, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useRidesDetailRideId } from '../../shared/use-rides-detail-ride-id';

/* * */

export function RideAcceptance() {
	//

	//
	// A. Setup variables

	const { rideId } = useRidesDetailRideId();
	// const justificationContext = useRideAcceptanceContext();

	//
	// C. Transform data

	// const analysisItems = useMemo(() => {
	// 	// Skip if no analysis data is available
	// 	if (!justificationContext.data.acceptance) return [];
	// 	// Transform the analysis data into an array of items
	// 	return Object.entries(justificationContext.data.acceptance.analysis_summary).map(([id, item]) => ({ id: id, ...item }));
	// }, [justificationContext.data.acceptance]);

	//
	// C. Render components

	// if (justificationContext.flags.loading) {
	// 	return <LoadingOverlay />;
	// }

	// if (justificationContext.flags.error) {
	// 	return <ErrorDisplay message={justificationContext.flags.error.message} />;
	// }

	return (
		<RideAcceptanceContextProvider rideId={rideId}>
			<Section gap="lg" padding="none">
				<Grid columns="aab" gap="md">
					{/* <RideAcceptanceCommentList />
					<RideAcceptanceJustification /> */}
				</Grid>
				<div style={{ width: '100%' }}>
					<Divider />
					{/* <RideAnalysisAnalyses /> */}
				</div>
			</Section>
		</RideAcceptanceContextProvider>
	);
}
