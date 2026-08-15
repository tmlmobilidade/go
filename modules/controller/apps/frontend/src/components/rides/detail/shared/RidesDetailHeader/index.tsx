'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CloseButton, IdTag, LoadingActivity, OperationalStatusDisplay, ProcessingStatusDisplay, SegmentedControl, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useRidesDetailCurrentView } from '../use-rides-detail-current-view';
import { useRidesDetailRideAnalysesData } from '../use-rides-detail-ride-analyses-data';
import { useRidesDetailRideData } from '../use-rides-detail-ride-data';
import { useRidesDetailRideId } from '../use-rides-detail-ride-id';

/* * */

export function RidesDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { t } = useTranslation();

	const { rideId } = useRidesDetailRideId();
	const { availableViews, currentView, setCurrentView } = useRidesDetailCurrentView();

	const { data: rideData, isLoading: rideIsLoading, isValidating: rideIsValidating, timestamp: rideTimestamp } = useRidesDetailRideData();
	const { isLoading: rideAnalysesIsLoading, isValidating: rideAnalysesIsValidating, timestamp: rideAnalysesTimestamp } = useRidesDetailRideAnalysesData();

	// const rideFavoritesContext = useRideFavoritesContext();

	//
	// B. Transform data

	const viewOptions = useMemo(() => {
		return availableViews.map(item => ({
			label: t(`default:rides.detail.RidesDetailViewNavigation.${item}.label`),
			value: item,
		}));
	}, [availableViews, t]);

	// const isFavorite = useMemo(() => {
	// 	if (!rideAnalysisContext.data.ride_id) return false;
	// 	return rideFavoritesContext.data.favorites.includes(rideAnalysisContext.data.ride_id);
	// }, [rideAnalysisContext.data.ride_id, rideFavoritesContext.data.favorites]);

	//
	// C. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.controller.RIDES_LIST));
	};

	// const handleToggleFavorite = () => {
	// 	if (!rideAnalysisContext.data.ride_id || rideFavoritesContext.flags.loading) return;
	// 	void rideFavoritesContext.actions.toggleFavorite(rideAnalysisContext.data.ride_id);
	// };

	//
	// D. Render components

	return (
		<Toolbar>
			<CloseButton onClick={handleClose} type="close" />
			<IdTag id={rideId} copyOnClick />
			<Spacer />
			<LoadingActivity
				isLoading={rideIsLoading || rideAnalysesIsLoading}
				isValidating={rideIsValidating || rideAnalysesIsValidating}
				timestamp={rideTimestamp || rideAnalysesTimestamp}
			/>
			<ProcessingStatusDisplay disabled={true} value={rideData?.processing_status} />
			{/* <GradeStatusDisplay value={rideData?.analysis_simple_three_vehicle_events_grade} /> */}
			<OperationalStatusDisplay value={rideData?.operational_status} />
			{/* <IconButton
				disabled={!rideAnalysisContext.data.ride_id || rideFavoritesContext.flags.loading}
				icon={isFavorite ? <IconHeartFilled /> : <IconHeart />}
				onClick={handleToggleFavorite}
				tooltip={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
				variant="primary"
			/> */}
			<SegmentedControl
				data={viewOptions}
				onChange={setCurrentView}
				value={currentView}
			/>
		</Toolbar>
	);
}
