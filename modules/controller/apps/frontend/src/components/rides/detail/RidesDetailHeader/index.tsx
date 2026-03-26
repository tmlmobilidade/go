'use client';

/* * */

import { AnalysisStatusTag } from '@/components/common/AnalysisStatusTag';
import { RideAnalysisSystemStatus } from '@/components/rides/analysis/RideAnalysisSystemStatus';
import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { useRidePinsContext } from '@/contexts/RidePins.context';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CloseButton, IconButton, IdTag, OperationalStatusTag, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function RidesDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const rideAnalysisContext = useRideAnalysisContext();
	const ridePinsContext = useRidePinsContext();

	const rideId = rideAnalysisContext.data.ride_id;
	const isPinned = rideId ? ridePinsContext.data.pins.includes(rideId) : false;

	//
	// B. Handle actions

	const handleGoBack = () => {
		router.push(keepUrlParams(PAGE_ROUTES.controller.RIDES_LIST));
	};

	const handlePinToggle = async () => {
		if (!rideId) return;
		if (isPinned) await ridePinsContext.actions.removePin(rideId);
		else await ridePinsContext.actions.addPin(rideId);
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
			<IconButton
				disabled={!rideId || ridePinsContext.flags.loading}
				icon={isPinned ? <IconHeartFilled /> : <IconHeart />}
				onClick={handlePinToggle}
				tooltip={isPinned ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
