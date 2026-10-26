'use client';

import { FareDetailBasicInfo } from '@/components/fares/detail/FareDetailBasicInfo';
import { FareDetailHeader } from '@/components/fares/detail/FareDetailHeader';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

import { useFaresDetailData } from '../use-fares-detail-data';

/* * */

export function FareDetail() {
	//

	//
	// A. Setup variables

	const { error, isLoading } = useFaresDetailData();

	//
	// B. Render components

	if (isLoading) {
		return <LoadingOverlay />;
	}

	if (error) {
		return <ErrorDisplay message={error} />;
	}

	return (
		<Pane header={[<FareDetailHeader key="header" />]}>
			<FareDetailBasicInfo />
		</Pane>
	);

	//
}
