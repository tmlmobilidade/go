'use client';

/* * */

import { RidesDetailAnalysisResult } from '@/components/rides/detail/RidesDetailAnalysisResult';
import { useRidesDetailJustificationContext } from '@/contexts/RidesDetailJustification.context';
import { ErrorDisplay, Grid, LoadingOverlay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { RidesDetailJustificationCommentList } from './RideDetailJustificationCommentList';

/* * */

export function RidesDetailJustification() {
	//
	// A. Setup variables

	const justificationContext = useRidesDetailJustificationContext();

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
		if (!justificationContext.data.justification) return [];
		// Transform the analysis data into an array of items
		return Object.entries(justificationContext.data.justification.analysis_summary).map(([id, item]) => ({ id, ...item }));
	}, [justificationContext.data.justification]);

	//
	// C. Render components

	return (
		<>
			<Grid columns="aab" gap="md">
				<RidesDetailJustificationCommentList items={justificationContext.data.justification.comments} />
			</Grid>
			<RidesDetailAnalysisResult items={analysisItems} />
		</>
	);
}
