'use client';

/* * */

import { RidesDetailAnalysisResult } from '@/components/rides/detail/RidesDetailAnalysisResult';
import { RidesDetailApexOnBoardRefunds } from '@/components/rides/detail/RidesDetailApexOnBoardRefunds';
import { RidesDetailApexOnBoardSales } from '@/components/rides/detail/RidesDetailApexOnBoardSales';
import { RidesDetailApexValidations } from '@/components/rides/detail/RidesDetailApexValidations';
import { RidesDetailHeader } from '@/components/rides/detail/RidesDetailHeader';
import { RidesDetailMap } from '@/components/rides/detail/RidesDetailMap';
import { RidesDetailMetadata } from '@/components/rides/detail/RidesDetailMetadata';
import { RidesDetailVehicleEvents } from '@/components/rides/detail/RidesDetailVehicleEvents';
import { useRidesDetailContext } from '@/contexts/RidesDetail.context';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

/* * */

export function RidesDetail() {
	//

	//
	// A. Setup variables

	const ridesDetailContext = useRidesDetailContext();

	//
	// B. Render components

	if (ridesDetailContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (ridesDetailContext.flags.error) {
		return <ErrorDisplay message={ridesDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<RidesDetailHeader />]}>
			<RidesDetailMap />
			<RidesDetailMetadata />
			<RidesDetailAnalysisResult />
			<RidesDetailVehicleEvents />
			<RidesDetailApexValidations />
			<RidesDetailApexOnBoardSales />
			<RidesDetailApexOnBoardRefunds />
		</Pane>
	);

	//
}
