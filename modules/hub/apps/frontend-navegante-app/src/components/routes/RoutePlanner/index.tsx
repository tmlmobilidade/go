'use client';

import { MAP_BOTTOM_SHEET_INITIAL_SNAP, MAP_BOTTOM_SHEET_SNAP_POINTS } from '@/components/common/bottom-sheet/bottom-sheet.constants';
import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { RoutePlannerItineraryDetail } from '@/components/routes/detail/RoutePlannerItineraryDetail';
import { RoutePlannerInput } from '@/components/routes/input/RoutePlannerInput';
import { RoutePlannerResults } from '@/components/routes/list/RoutePlannerResults';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { RoutePlannerPlaceDetail } from '@/components/routes/RoutePlannerPlaceDetail';
import { OmniSearch } from '@/components/search/OmniSearch';
import { type RoutePlannerLocation } from '@/utils/route-planner-motis';
import { getRoutePlannerCloseAction, getRoutePlannerItineraryDetailInitialSnap } from '@/utils/route-planner-navigation';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RoutePlannerSheetConfig {
	disableDismiss: boolean
	headerMode: 'default' | 'handle'
	initialSnap: number
	mapAware: boolean
	snapPoints?: number[]
	title?: string
	withCloseButton: boolean
	withCompactCloseButton: boolean
	withOverlay: boolean
}

interface RoutePlannerSheetTitles {
	destinationSearch: string
	fullInput: string
	itineraryDetail: string
	originSearch: string
}

/* * */

// NOTE: react-modal-sheet requires the first snap point to be 0 (it mutates the array to
// force this otherwise), and treats `snapTo(0)` as an alias for closing the sheet rather than
// animating to it. So index 0 is always "closed" here, and the smallest *visible* snap is index 1.
const ROUTE_PLANNER_SHEET_SNAP_POINTS = {
	destinationSearch: [0, 0.72, 0.95],
	fullInput: [0, 0.52, 0.95],
	itineraryDetail: [0, 0.14, MAP_BOTTOM_SHEET_SNAP_POINTS[MAP_BOTTOM_SHEET_INITIAL_SNAP], 0.64, 0.95],
};

/* * */

export function RoutePlanner() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { activeBottomSheet, closeActiveBottomSheet } = useBottomSheet();
	const routePlannerContext = useRoutePlannerContext();

	//
	// B. Transform data

	const sheetConfig = getRoutePlannerSheetConfig(
		routePlannerContext.data.view_mode,
		{
			destinationSearch: t('default:routes.RoutePlannerSearch.destination_title'),
			fullInput: t('default:routes.RoutePlanner.title'),
			itineraryDetail: t('default:routes.RoutePlanner.results.route_summary'),
			originSearch: t('default:routes.RoutePlannerSearch.origin_title'),
		},
		routePlannerContext.data.location_search_target,
		routePlannerContext.flags.is_navigating,
	);

	//
	// C. Handle actions

	const handleClose = () => {
		const closeAction = getRoutePlannerCloseAction({
			hasRouteContext: !!routePlannerContext.data.origin && !!routePlannerContext.data.destination,
			isNavigating: routePlannerContext.flags.is_navigating,
			viewMode: routePlannerContext.data.view_mode,
			wasOpenedFromPlace: routePlannerContext.data.was_opened_from_place,
		});

		if (closeAction === 'dismiss-trip-sheets') return routePlannerContext.actions.dismissTripSheets();
		if (closeAction === 'open-results') return routePlannerContext.actions.openResults();
		if (closeAction === 'open-place-detail') return routePlannerContext.actions.openPlaceDetail();

		if (closeAction === 'clear-route') routePlannerContext.actions.clearRoute();
		closeActiveBottomSheet();
	};

	const handleLocationSelect = (location: RoutePlannerLocation) => {
		if (routePlannerContext.data.location_search_target === 'origin') {
			void routePlannerContext.actions.selectOrigin(location);
			return;
		}

		void routePlannerContext.actions.selectDestination(location);
	};

	//
	// D. Render components

	return (
		<BottomSheet
			disableDismiss={sheetConfig.disableDismiss}
			headerMode={sheetConfig.headerMode}
			initialSnap={sheetConfig.initialSnap}
			mapAware={sheetConfig.mapAware}
			onClose={handleClose}
			opened={activeBottomSheet?.view === 'routes'}
			snapPoints={sheetConfig.snapPoints}
			title={sheetConfig.title}
			withCloseButton={sheetConfig.withCloseButton}
			withCompactCloseButton={sheetConfig.withCompactCloseButton}
			withOverlay={sheetConfig.withOverlay}
		>
			{routePlannerContext.data.view_mode === 'destination-search' && (
				<OmniSearch
					onLocationSelect={handleLocationSelect}
					placeholder={routePlannerContext.data.location_search_target === 'origin'
						? t('default:routes.RoutePlannerSearch.origin_placeholder')
						: t('default:routes.RoutePlannerSearch.destination_placeholder')}
					locationPicker
				/>
			)}

			{routePlannerContext.data.view_mode === 'full-input' && (
				<>
					<div className={styles.inputWrapper}>
						<RoutePlannerInput
							destination={routePlannerContext.data.destination}
							onDestinationChange={routePlannerContext.actions.setDestination}
							onOriginChange={routePlannerContext.actions.setOrigin}
							onSwap={routePlannerContext.actions.swapLocations}
							onTravelTimeChange={routePlannerContext.actions.setTravelTime}
							onTravelTimeModeChange={routePlannerContext.actions.setTravelTimeMode}
							origin={routePlannerContext.data.origin}
							travelTime={routePlannerContext.data.travel_time}
							variant="compact"
						/>
					</div>

					<button
						className={styles.planButton}
						disabled={routePlannerContext.flags.is_planning || !routePlannerContext.data.origin || !routePlannerContext.data.destination}
						onClick={() => void routePlannerContext.actions.planRoute()}
						type="button"
					>
						{routePlannerContext.flags.is_planning ? t('default:routes.RoutePlanner.actions.planning') : t('default:routes.RoutePlanner.actions.plan')}
					</button>
				</>
			)}

			{routePlannerContext.data.view_mode === 'results' && <RoutePlannerResults />}

			{routePlannerContext.data.view_mode === 'place-detail' && <RoutePlannerPlaceDetail />}

			{routePlannerContext.data.view_mode === 'itinerary-detail' && <RoutePlannerItineraryDetail />}
		</BottomSheet>
	);

	//
}

/* * */

function getRoutePlannerSheetConfig(
	viewMode: ReturnType<typeof useRoutePlannerContext>['data']['view_mode'],
	titles: RoutePlannerSheetTitles,
	searchTarget: ReturnType<typeof useRoutePlannerContext>['data']['location_search_target'],
	isNavigating: boolean,
): RoutePlannerSheetConfig {
	if (viewMode === 'destination-search') {
		return {
			disableDismiss: false,
			headerMode: 'default',
			initialSnap: 1,
			mapAware: false,
			snapPoints: ROUTE_PLANNER_SHEET_SNAP_POINTS.destinationSearch,
			title: searchTarget === 'origin' ? titles.originSearch : titles.destinationSearch,
			withCloseButton: false,
			withCompactCloseButton: false,
			withOverlay: true,
		};
	}

	if (viewMode === 'full-input') {
		return {
			disableDismiss: false,
			headerMode: 'default',
			initialSnap: 1,
			mapAware: false,
			snapPoints: ROUTE_PLANNER_SHEET_SNAP_POINTS.fullInput,
			title: titles.fullInput,
			withCloseButton: true,
			withCompactCloseButton: false,
			withOverlay: true,
		};
	}

	if (viewMode === 'itinerary-detail') {
		return {
			disableDismiss: true,
			headerMode: 'handle',
			initialSnap: getRoutePlannerItineraryDetailInitialSnap(isNavigating),
			mapAware: true,
			snapPoints: ROUTE_PLANNER_SHEET_SNAP_POINTS.itineraryDetail,
			withCloseButton: true,
			withCompactCloseButton: true,
			withOverlay: false,
		};
	}

	if (viewMode === 'place-detail') {
		return {
			disableDismiss: false,
			headerMode: 'handle',
			initialSnap: 1,
			mapAware: true,
			withCloseButton: true,
			withCompactCloseButton: true,
			withOverlay: false,
		};
	}

	return {
		disableDismiss: false,
		headerMode: 'handle',
		initialSnap: 1,
		mapAware: true,
		withCloseButton: true,
		withCompactCloseButton: true,
		withOverlay: false,
	};
}
