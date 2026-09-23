'use client';

import { useRidesFavoritesData } from '@/components/rides/shared/use-rides-favorites-data';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Ride } from '@tmlmobilidade/go-types-operation';
import { hasPermissionResource } from '@tmlmobilidade/go-types-permissions';
import { ProcessingStatus } from '@tmlmobilidade/go-types-shared';
import { CloseButton, fetchApiData, IconButton, IdTag, keepUrlParams, LoadingActivity, OperationalStatusDisplay, ProcessingStatusDisplay, SegmentedControl, Spacer, Toolbar, useHandleAction, useMeData } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useRidesDetailApexBankingTapsData } from '../use-rides-detail-apex-banking-taps-data';
import { useRidesDetailApexRefundsData } from '../use-rides-detail-apex-refunds-data';
import { useRidesDetailApexSalesData } from '../use-rides-detail-apex-sales-data';
import { useRidesDetailApexValidationsData } from '../use-rides-detail-apex-validations-data';
import { useRidesDetailCurrentView } from '../use-rides-detail-current-view';
import { useRidesDetailHashedTripData } from '../use-rides-detail-hashed-trip-data';
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

	const { data: meData } = useMeData();

	const { rideId } = useRidesDetailRideId();
	const { availableViews, currentView, setCurrentView } = useRidesDetailCurrentView();

	const { data: rideData, isLoading: rideIsLoading, isValidating: rideIsValidating, mutate: ridesDetailRideMutate, timestamp: rideTimestamp } = useRidesDetailRideData();
	const { isLoading: rideAnalysesIsLoading, isValidating: rideAnalysesIsValidating, timestamp: rideAnalysesTimestamp } = useRidesDetailRideAnalysesData();
	const { isLoading: hashedTripIsLoading, isValidating: hashedTripIsValidating, timestamp: hashedTripTimestamp } = useRidesDetailHashedTripData();
	const { isLoading: simplifiedApexBankingTapsIsLoading, isValidating: simplifiedApexBankingTapsIsValidating, timestamp: simplifiedApexBankingTapsTimestamp } = useRidesDetailApexBankingTapsData();
	const { isLoading: simplifiedApexValidationsIsLoading, isValidating: simplifiedApexValidationsIsValidating, timestamp: simplifiedApexValidationsTimestamp } = useRidesDetailApexValidationsData();
	const { isLoading: simplifiedApexSalesIsLoading, isValidating: simplifiedApexSalesIsValidating, timestamp: simplifiedApexSalesTimestamp } = useRidesDetailApexSalesData();
	const { isLoading: simplifiedApexRefundsIsLoading, isValidating: simplifiedApexRefundsIsValidating, timestamp: simplifiedApexRefundsTimestamp } = useRidesDetailApexRefundsData();

	const { data: favoriteRideIds, isLoading: isTogglingFavorite, toggleFavorite } = useRidesFavoritesData();

	//
	// B. Transform data

	const viewOptions = useMemo(() => {
		return availableViews.map(item => ({
			label: t(`default:rides.detail.RidesDetailViewNavigation.${item}.label`),
			value: item,
		}));
	}, [availableViews, t]);

	const isFavorite = useMemo(() => {
		if (!rideId) return false;
		return favoriteRideIds.includes(rideId);
	}, [favoriteRideIds, rideId]);

	const hasPermissionToChangeProcessingStatus = useMemo(() => {
		return hasPermissionResource(meData.permissions, {
			requiredPermission: { action: 'analysis_reprocess', scope: 'rides' },
			requiredValue: rideData?.agency_id,
			resourceKey: 'agency_ids',
		});
	}, [meData.permissions, rideData?.agency_id]);

	//
	// C. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.operation.RIDES_LIST));
	};

	const { action: handleUpdateProcessingStatus, isLoading: isUpdatingRideProcessingStatus } = useHandleAction<Ride, ProcessingStatus>({
		fetchFn: async data => await fetchApiData<Ride, { processing_status: ProcessingStatus }>({ body: { processing_status: data }, method: 'PUT', url: API_ROUTES.operation.RIDES_DETAIL_PROCESSING_STATUS(rideId) }),
		onSuccess: () => {
			ridesDetailRideMutate();
		},
	});

	const handleToggleFavorite = () => {
		if (!rideId || isTogglingFavorite) return;
		void toggleFavorite(rideId);
	};

	//
	// D. Render components

	return (
		<Toolbar>
			<CloseButton onClick={handleClose} type="close" />
			<IdTag id={rideId} copyOnClick />
			<Spacer />
			<LoadingActivity
				isLoading={rideIsLoading || rideAnalysesIsLoading || hashedTripIsLoading || simplifiedApexBankingTapsIsLoading || simplifiedApexValidationsIsLoading || simplifiedApexSalesIsLoading || simplifiedApexRefundsIsLoading}
				isValidating={rideIsValidating || rideAnalysesIsValidating || hashedTripIsValidating || simplifiedApexBankingTapsIsValidating || simplifiedApexValidationsIsValidating || simplifiedApexSalesIsValidating || simplifiedApexRefundsIsValidating}
				timestamp={[rideTimestamp, rideAnalysesTimestamp, hashedTripTimestamp, simplifiedApexBankingTapsTimestamp, simplifiedApexValidationsTimestamp, simplifiedApexSalesTimestamp, simplifiedApexRefundsTimestamp]}
			/>
			<ProcessingStatusDisplay
				disabled={!hasPermissionToChangeProcessingStatus || isUpdatingRideProcessingStatus}
				onChange={handleUpdateProcessingStatus}
				value={rideData?.processing_status}
			/>
			{/* <GradeStatusDisplay value={rideData?.analysis_simple_three_vehicle_events_grade} /> */}
			<OperationalStatusDisplay value={rideData?.operational_status} />
			<SegmentedControl
				data={viewOptions}
				onChange={setCurrentView}
				value={currentView}
			/>
			<IconButton
				icon={isFavorite ? <IconHeartFilled /> : <IconHeart />}
				isDisabled={!rideId || isTogglingFavorite}
				onClick={handleToggleFavorite}
				variant="primary"
				tooltip={isFavorite
					? t('default:rides.detail.RidesDetailHeader.favorites.remove')
					: t('default:rides.detail.RidesDetailHeader.favorites.add')}
			/>
		</Toolbar>
	);
}
