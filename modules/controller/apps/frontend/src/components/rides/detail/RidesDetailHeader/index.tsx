'use client';

import { AnalysisStatusTag } from '@/components/common/AnalysisStatusTag';
import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { useRideFavoritesContext } from '@/contexts/RideFavorites.context';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CloseButton, IconButton, IdTag, OperationalStatusTag, ProcessingStatusTag, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

/* * */

export function RidesDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const rideAnalysisContext = useRideAnalysisContext();
	const rideFavoritesContext = useRideFavoritesContext();

	//
	// B. Transform data

	const isFavorite = useMemo(() => {
		if (!rideAnalysisContext.data.ride_id) return false;
		return rideFavoritesContext.data.favorites.includes(rideAnalysisContext.data.ride_id);
	}, [rideAnalysisContext.data.ride_id, rideFavoritesContext.data.favorites]);

	//
	// C. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.controller.RIDES_LIST));
	};

	const handleToggleFavorite = () => {
		if (!rideAnalysisContext.data.ride_id || rideFavoritesContext.flags.loading) return;
		void rideFavoritesContext.actions.toggleFavorite(rideAnalysisContext.data.ride_id);
	};

	//
	// D. Render components

	return (
		<Toolbar>
			<CloseButton onClick={handleClose} type="close" />
			<IdTag id={rideAnalysisContext.data.ride_id} copyOnClick />
			<Spacer />
			<ProcessingStatusTag disabled={true} value={rideAnalysisContext.data.ride?.system_status} />
			<AnalysisStatusTag grade={rideAnalysisContext.data.ride?.analysis_simple_three_vehicle_events_grade} />
			<OperationalStatusTag value={rideAnalysisContext.data.ride?.operational_status} />
			<IconButton
				disabled={!rideAnalysisContext.data.ride_id || rideFavoritesContext.flags.loading}
				icon={isFavorite ? <IconHeartFilled /> : <IconHeart />}
				onClick={handleToggleFavorite}
				tooltip={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
				variant="primary"
			/>
		</Toolbar>
	);
}
