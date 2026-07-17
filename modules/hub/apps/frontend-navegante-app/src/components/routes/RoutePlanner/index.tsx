'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/ReactModalSheet';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { RoutePlannerDestinationSearch } from '@/components/routes/RoutePlannerDestinationSearch';
import { RoutePlannerInput } from '@/components/routes/RoutePlannerInput';
import { RoutePlannerItineraryDetail } from '@/components/routes/RoutePlannerItineraryDetail';
import { RoutePlannerPlaceDetail } from '@/components/routes/RoutePlannerPlaceDetail';
import { RoutePlannerResults } from '@/components/routes/RoutePlannerResults';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RoutePlannerSheetConfig {
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

const ROUTE_PLANNER_SHEET_SNAP_POINTS = {
	destinationSearch: [0, 0.72, 0.95],
	fullInput: [0, 0.52, 0.95],
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

	const sheetConfig = getRoutePlannerSheetConfig(routePlannerContext.data.view_mode, {
		destinationSearch: t('default:routes.RoutePlannerSearch.destination_title'),
		fullInput: t('default:routes.RoutePlanner.title'),
		itineraryDetail: t('default:routes.RoutePlanner.results.route_summary'),
		originSearch: t('default:routes.RoutePlannerSearch.origin_title'),
	}, routePlannerContext.data.location_search_target);

	//
	// C. Handle actions

	const handleClose = () => {
		if (routePlannerContext.data.view_mode === 'itinerary-detail') {
			routePlannerContext.actions.openResults();
			return;
		}

		if (routePlannerContext.data.view_mode === 'results') {
			if (routePlannerContext.data.was_opened_from_place) {
				routePlannerContext.actions.openPlaceDetail();
				return;
			}

			routePlannerContext.actions.clearRoute();
			closeActiveBottomSheet();
			return;
		}

		closeActiveBottomSheet();
	};

	//
	// D. Render components

	return (
		<BottomSheet
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
				<RoutePlannerDestinationSearch />
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

function getRoutePlannerSheetConfig(viewMode: ReturnType<typeof useRoutePlannerContext>['data']['view_mode'], titles: RoutePlannerSheetTitles, searchTarget: ReturnType<typeof useRoutePlannerContext>['data']['location_search_target']): RoutePlannerSheetConfig {
	if (viewMode === 'destination-search') {
		return {
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
			headerMode: 'handle',
			initialSnap: 1,
			mapAware: true,
			withCloseButton: true,
			withCompactCloseButton: true,
			withOverlay: false,
		};
	}

	if (viewMode === 'place-detail') {
		return {
			headerMode: 'handle',
			initialSnap: 1,
			mapAware: true,
			withCloseButton: true,
			withCompactCloseButton: true,
			withOverlay: false,
		};
	}

	return {
		headerMode: 'handle',
		initialSnap: 1,
		mapAware: true,
		withCloseButton: true,
		withCompactCloseButton: true,
		withOverlay: false,
	};
}
