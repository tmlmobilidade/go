'use client';

import { RideAcceptanceCommentList } from '@/components/rides/detail/acceptance/RideAcceptanceCommentList';
import { RideAcceptanceJustification } from '@/components/rides/detail/acceptance/RideAcceptanceJustification';
import { useRideAcceptanceData } from '@/components/rides/detail/acceptance/use-ride-acceptance-data';
import { Divider, ErrorDisplay, Grid, LoadingOverlay, Section } from '@tmlmobilidade/ui';

/* * */

export function RideAcceptance() {
	//

	//
	// A. Setup variables

	const { error, isLoading } = useRideAcceptanceData();

	//
	// B. Render components

	if (isLoading) {
		return <LoadingOverlay />;
	}

	if (error) {
		return <ErrorDisplay message={error} />;
	}

	return (
		<Section gap="lg" padding="none">
			<Grid columns="aab" gap="md">
				<RideAcceptanceCommentList />
				<RideAcceptanceJustification />
			</Grid>
			<div style={{ width: '100%' }}>
				<Divider />
			</div>
		</Section>
	);

	//
}
