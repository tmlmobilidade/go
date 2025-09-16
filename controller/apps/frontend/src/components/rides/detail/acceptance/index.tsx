'use client';

/* * */

import { RidesDetailAnalysisResult } from '@/components/rides/detail/RidesDetailAnalysisResult';
import { useRidesDetailAcceptanceContext } from '@/contexts/RidesDetailAcceptance.context';
import { ErrorDisplay, Grid, LoadingOverlay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { RidesDetailAcceptanceCommentList } from './RideDetailAcceptanceCommentList';

/* * */

export function RidesDetailAcceptance() {
	//
	// A. Setup variables

	const justificationContext = useRidesDetailAcceptanceContext();

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
		<>
			<Grid columns="aab" gap="md">
				<RidesDetailAcceptanceCommentList items={justificationContext.data.acceptance.comments} />
				<RidesDetailAcceptanceCommentList items={justificationContext.data.acceptance.comments} />
			</Grid>
			<RidesDetailAnalysisResult items={analysisItems} />
		</>
	);
}
