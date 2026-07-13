'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { RoutePlannerDestinationSearch } from '@/components/routes/RoutePlannerDestinationSearch';
import { RoutePlannerInput } from '@/components/routes/RoutePlannerInput';
import { RoutePlannerItineraryDetail } from '@/components/routes/RoutePlannerItineraryDetail';
import { RoutePlannerResults } from '@/components/routes/RoutePlannerResults';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

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

	const title = routePlannerContext.data.view_mode === 'destination-search'
		? t('default:routes.RoutePlannerSearch.title')
		: t('default:routes.RoutePlanner.title');

	const isResultsView = routePlannerContext.data.view_mode === 'results';
	const isMapPreviewView = isResultsView;

	//
	// C. Render components

	return (
		<BottomSheet
			onClose={closeActiveBottomSheet}
			opened={activeBottomSheet?.view === 'routes'}
			size="half"
			title={title}
			withOverlay={!isMapPreviewView}
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

			{routePlannerContext.data.view_mode === 'itinerary-detail' && <RoutePlannerItineraryDetail />}
		</BottomSheet>
	);

	//
}
