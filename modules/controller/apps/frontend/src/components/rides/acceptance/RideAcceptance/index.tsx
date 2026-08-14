'use client';

import { RideAcceptanceCommentList } from '@/components/rides/detail/acceptance/RideAcceptanceCommentList';
import { RideAcceptanceJustification } from '@/components/rides/detail/acceptance/RideAcceptanceJustification';
import { RideAnalysisResult } from '@/components/rides/detail/analysis/RideAnalysisAnalyses';
import { useRideAcceptanceContext } from '@/contexts/RideAcceptance.context';
import { Divider, ErrorDisplay, Grid, LoadingOverlay, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function RideAcceptance() {
	//

	//
	// A. Setup variables

	const justificationContext = useRideAcceptanceContext();

	//
	// C. Transform data

	const analysisItems = useMemo(() => {
		// Skip if no analysis data is available
		if (!justificationContext.data.acceptance) return [];
		// Transform the analysis data into an array of items
		return Object.entries(justificationContext.data.acceptance.analysis_summary).map(([id, item]) => ({ id: id, ...item }));
	}, [justificationContext.data.acceptance]);

	//
	// C. Render components

	if (justificationContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (justificationContext.flags.error) {
		return <ErrorDisplay message={justificationContext.flags.error.message} />;
	}

	return (
		<Section gap="lg" padding="none">
			<Grid columns="aab" gap="md">
				<RideAcceptanceCommentList />
				<RideAcceptanceJustification />
			</Grid>
			<div style={{ width: '100%' }}>
				<Divider />
				<RideAnalysisResult defaultOpen={true} items={analysisItems} />
			</div>
		</Section>
	);
}
