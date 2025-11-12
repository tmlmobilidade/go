'use client';

/* * */

import { RideAnalysisAnalysisResult } from '@/components/rides/analysis/RideAnalysisResult';
import { useRideAcceptanceContext } from '@/contexts/RideAcceptance.context';
import { ErrorDisplay, Grid, LoadingOverlay, Section, Separator } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { RideAcceptanceCommentList } from '../RideAcceptanceCommentList';
import { RideAcceptanceJustification } from '../RideAcceptanceJustification';

/* * */

export function RideAcceptance() {
	//
	// A. Setup variables

	const justificationContext = useRideAcceptanceContext();

	//
	// B. Render components

	if (justificationContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (justificationContext.flags.error) {
		return <ErrorDisplay message={justificationContext.flags.error.message} />;
	}

	//
	// C. Transform data

	const analysisItems = useMemo(() => {
		// Skip if no analysis data is available
		if (!justificationContext.data.acceptance) return [];
		// Transform the analysis data into an array of items
		return Object.entries(justificationContext.data.acceptance.analysis_summary).map(([id, item]) => ({ id, ...item }));
	}, [justificationContext.data.acceptance]);

	//
	// C. Render components

	return (
		<Section gap="lg" padding="none">
			<Grid columns="aab" gap="md">
				<RideAcceptanceCommentList />
				<RideAcceptanceJustification />
			</Grid>
			<div style={{ width: '100%' }}>
				<Separator />
				<RideAnalysisAnalysisResult defaultOpen={true} items={analysisItems} />
			</div>
		</Section>
	);
}
