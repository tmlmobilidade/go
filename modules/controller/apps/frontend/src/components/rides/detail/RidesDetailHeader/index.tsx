'use client';

/* * */

import { AnalysisStatusTag } from '@/components/common/AnalysisStatusTag';
import { RideAnalysisSystemStatus } from '@/components/rides/analysis/RideAnalysisSystemStatus';
import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { useRideFavoritesContext } from '@/contexts/RideFavorites.context';
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
	const rideFavoritesContext = useRideFavoritesContext();

	const rideId = rideAnalysisContext.data.ride_id;
	const isFavorite = rideId ? rideFavoritesContext.data.favorites.includes(rideId) : false;

	//
	// B. Handle actions

	const handleGoBack = () => {
		router.push(keepUrlParams(PAGE_ROUTES.controller.RIDES_LIST));
	};

	const handleToggleFavorite = () => {
		if (!rideId || rideFavoritesContext.flags.loading) return;
		void rideFavoritesContext.actions.toggleFavorite(rideId);
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
				disabled={!rideId || rideFavoritesContext.flags.loading}
				icon={isFavorite ? <IconHeartFilled /> : <IconHeart />}
				onClick={handleToggleFavorite}
				tooltip={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
