'use client';

/* * */

import { AnalysisStatusTag } from '@/components/common/AnalysisStatusTag';
import { RideAnalysisSystemStatus } from '@/components/rides/analysis/RideAnalysisSystemStatus';
import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CloseButton, IdTag, OperationalStatusTag, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function RidesDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const rideAnalysisContext = useRideAnalysisContext();

	//
	// B. Handle actions

	const handleGoBack = () => {
		router.push(keepUrlParams(PAGE_ROUTES.controller.RIDES_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<CloseButton onClick={handleGoBack} type="close" />
			<IdTag id={rideAnalysisContext.data.ride_id} copyOnClick />
			<Spacer />
			<RideAnalysisSystemStatus />
			<AnalysisStatusTag grade={rideAnalysisContext.data.ride?.analysis_simple_three_vehicle_events_grade} />
			<OperationalStatusTag value={rideAnalysisContext.data.ride?.operational_status} />
		</Toolbar>
	);

	//
}
