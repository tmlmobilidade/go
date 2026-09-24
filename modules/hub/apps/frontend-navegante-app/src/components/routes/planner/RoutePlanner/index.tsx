'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { RoutePlannerItineraryDetail } from '@/components/routes/detail/RoutePlannerItineraryDetail';
import { RoutePlannerPlaceDetail } from '@/components/routes/detail/RoutePlannerPlaceDetail';
import { RoutePlannerResults } from '@/components/routes/list/RoutePlannerResults';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { Search } from '@/components/search/Search';
import { MAP_BOTTOM_SHEET_SNAP_POINTS } from '@/constants/bottom-sheet';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { type RoutePlannerLocation } from '@/types/route-planner/models';
import { getRoutePlannerBackAction, getRoutePlannerDismissAction, getRoutePlannerItineraryDetailInitialSnap } from '@/utils/route-planner/planning/navigation';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RoutePlannerSheetConfig {
	accessibleTitle: string
	disableDismiss: boolean
	headerMode: 'default' | 'handle'
	initialSnap: number
	mapAware: boolean
	modality: 'modal' | 'non-modal'
	snapPoints?: number[]
	title?: string
	withCloseButton: boolean
	withCompactCloseButton: boolean
	withOverlay: boolean
}

interface RoutePlannerSheetTitles {
	destinationSearch: string
	itineraryDetail: string
	originSearch: string
	placeDetail: string
	routeOptions: string
}

/* * */

// NOTE: react-modal-sheet requires the first snap point to be 0 (it mutates the array to
// force this otherwise), and treats `snapTo(0)` as an alias for closing the sheet rather than
// animating to it. So index 0 is always "closed" here, and the smallest *visible* snap is index 1.
const ROUTE_PLANNER_SHEET_SNAP_POINTS = {
	destinationSearch: [0, 1],
	itineraryDetail: MAP_BOTTOM_SHEET_SNAP_POINTS,
};

/* * */

export function RoutePlanner() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { activeBottomSheet, pop } = useBottomSheet();
	const routePlannerContext = useRoutePlannerContext();
	const searchInputRef = useRef<HTMLInputElement>(null);
	const viewFocusRef = useRef<HTMLElement>(null);
	const previousViewModeRef = useRef(routePlannerContext.data.view_mode);

	//
	// B. Transform data

	const sheetConfig = getRoutePlannerSheetConfig(
		routePlannerContext.data.view_mode,
		{
			destinationSearch: t('default:routes.RoutePlannerSearch.destination_title'),
			itineraryDetail: t('default:routes.RoutePlanner.results.route_summary'),
			originSearch: t('default:routes.RoutePlannerSearch.origin_title'),
			placeDetail: t('default:routes.RoutePlanner.place_detail.title'),
			routeOptions: t('default:routes.RoutePlanner.results.route_options'),
		},
		routePlannerContext.data.location_search_target,
		routePlannerContext.flags.is_navigating,
	);
	const backAction = getRoutePlannerBackAction({
		hasRouteContext: !!routePlannerContext.data.origin && !!routePlannerContext.data.destination,
		isNavigating: routePlannerContext.flags.is_navigating,
		locationSearchReturnView: routePlannerContext.data.location_search_return_view,
		viewMode: routePlannerContext.data.view_mode,
		wasOpenedFromPlace: routePlannerContext.data.was_opened_from_place,
	});

	useEffect(() => {
		const previousViewMode = previousViewModeRef.current;
		previousViewModeRef.current = routePlannerContext.data.view_mode;

		if (previousViewMode === routePlannerContext.data.view_mode || activeBottomSheet?.view !== 'routes') return;

		const animationFrameId = window.requestAnimationFrame(() => {
			if (routePlannerContext.data.view_mode === 'destination-search') {
				searchInputRef.current?.focus({ preventScroll: true });
				return;
			}

			viewFocusRef.current?.focus({ preventScroll: true });
		});

		return () => window.cancelAnimationFrame(animationFrameId);
	}, [activeBottomSheet?.view, routePlannerContext.data.view_mode]);

	//
	// C. Handle actions

	const handleClose = () => {
		const dismissAction = getRoutePlannerDismissAction({ isNavigating: routePlannerContext.flags.is_navigating });
		if (dismissAction === 'dismiss-trip-sheets') return routePlannerContext.actions.dismissTripSheets();

		routePlannerContext.actions.clearRoute();
		pop();
	};

	const handleBack = () => {
		if (backAction === 'open-results') return routePlannerContext.actions.openResults();
		if (backAction === 'open-place-detail') return routePlannerContext.actions.openPlaceDetail();
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
			accessibleTitle={sheetConfig.accessibleTitle}
			disableDismiss={sheetConfig.disableDismiss}
			headerMode={sheetConfig.headerMode}
			initialFocusRef={routePlannerContext.data.view_mode === 'destination-search' ? searchInputRef : undefined}
			initialSnap={sheetConfig.initialSnap}
			mapAware={sheetConfig.mapAware}
			modality={sheetConfig.modality}
			onBack={backAction ? handleBack : undefined}
			onClose={handleClose}
			opened={activeBottomSheet?.view === 'routes'}
			snapPoints={sheetConfig.snapPoints}
			title={sheetConfig.title}
			withCloseButton={sheetConfig.withCloseButton}
			withCompactCloseButton={sheetConfig.withCompactCloseButton}
			withOverlay={sheetConfig.withOverlay}
		>
			{routePlannerContext.data.view_mode === 'destination-search' && (
				<Search
					key={routePlannerContext.data.location_search_target}
					inputRef={searchInputRef}
					onLocationSelect={handleLocationSelect}
					placeholder={routePlannerContext.data.location_search_target === 'origin'
						? t('default:routes.RoutePlannerSearch.origin_placeholder')
						: t('default:routes.RoutePlannerSearch.destination_placeholder')}
					locationPicker
				/>
			)}

			{routePlannerContext.data.view_mode !== 'destination-search' && (
				<section ref={viewFocusRef} aria-label={sheetConfig.accessibleTitle} className={styles.view} tabIndex={-1}>
					{routePlannerContext.data.view_mode === 'results' && <RoutePlannerResults />}

					{routePlannerContext.data.view_mode === 'place-detail' && <RoutePlannerPlaceDetail />}

					{routePlannerContext.data.view_mode === 'itinerary-detail' && <RoutePlannerItineraryDetail />}
				</section>
			)}
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
		const title = searchTarget === 'origin' ? titles.originSearch : titles.destinationSearch;

		return {
			accessibleTitle: title,
			disableDismiss: false,
			headerMode: 'default',
			initialSnap: 1,
			mapAware: false,
			modality: 'modal',
			snapPoints: ROUTE_PLANNER_SHEET_SNAP_POINTS.destinationSearch,
			title,
			withCloseButton: false,
			withCompactCloseButton: false,
			withOverlay: true,
		};
	}

	if (viewMode === 'itinerary-detail') {
		return {
			accessibleTitle: titles.itineraryDetail,
			disableDismiss: true,
			headerMode: 'handle',
			initialSnap: getRoutePlannerItineraryDetailInitialSnap(isNavigating),
			mapAware: true,
			modality: 'non-modal',
			snapPoints: ROUTE_PLANNER_SHEET_SNAP_POINTS.itineraryDetail,
			withCloseButton: true,
			withCompactCloseButton: true,
			withOverlay: false,
		};
	}

	if (viewMode === 'place-detail') {
		return {
			accessibleTitle: titles.placeDetail,
			disableDismiss: false,
			headerMode: 'handle',
			initialSnap: 1,
			mapAware: true,
			modality: 'non-modal',
			withCloseButton: true,
			withCompactCloseButton: true,
			withOverlay: false,
		};
	}

	return {
		accessibleTitle: titles.routeOptions,
		disableDismiss: false,
		headerMode: 'handle',
		initialSnap: 1,
		mapAware: true,
		modality: 'non-modal',
		withCloseButton: true,
		withCompactCloseButton: true,
		withOverlay: false,
	};
}
