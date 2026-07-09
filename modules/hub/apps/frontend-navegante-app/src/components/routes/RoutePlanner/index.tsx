'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { RoutePlannerInput } from '@/components/routes/RoutePlannerInput';
import { RoutePlannerItineraryCard } from '@/components/routes/RoutePlannerItineraryCard';
import { buildMotisPlanParams, buildMotisProxyUrl, getMotisItineraries, type MotisPlanResponse, type RoutePlannerLocation, type RoutePlannerTravelTime, type RoutePlannerTravelTimeMode } from '@/utils/route-planner-motis';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function RoutePlanner() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { activeBottomSheet, closeActiveBottomSheet } = useBottomSheet();

	const [origin, setOrigin] = useState<null | RoutePlannerLocation>(null);
	const [destination, setDestination] = useState<null | RoutePlannerLocation>(null);
	const [plan, setPlan] = useState<MotisPlanResponse | null>(null);
	const [planError, setPlanError] = useState<null | string>(null);
	const [travelTime, setTravelTime] = useState<RoutePlannerTravelTime>(() => ({ date: new Date(), mode: 'now' }));
	const [isPlanning, setIsPlanning] = useState(false);

	//
	// B. Transform data

	const itineraries = getMotisItineraries(plan);

	//
	// C. Handle actions

	const handleSwap = () => {
		setOrigin(destination);
		setDestination(origin);
		setPlan(null);
		setPlanError(null);
	};

	const handleTravelTimeChange = (date: Date) => {
		setTravelTime(current => ({ ...current, date }));
		setPlan(null);
		setPlanError(null);
	};

	const handleTravelTimeModeChange = (mode: RoutePlannerTravelTimeMode) => {
		setTravelTime(current => ({
			date: mode === 'now' || current.mode === 'now' ? new Date() : current.date,
			mode,
		}));
		setPlan(null);
		setPlanError(null);
	};

	const handlePlanRoute = async () => {
		if (!origin || !destination) {
			setPlanError(t('default:routes.RoutePlanner.errors.missing_locations'));
			return;
		}

		setIsPlanning(true);
		setPlan(null);
		setPlanError(null);

		try {
			const response = await fetch(buildMotisProxyUrl('/api/v6/plan', buildMotisPlanParams(origin, destination, travelTime)));

			if (!response.ok) throw new Error(`MOTIS returned HTTP ${response.status}`);

			const data: MotisPlanResponse = await response.json();
			setPlan(data);

			if (getMotisItineraries(data).length === 0) {
				setPlanError(t('default:routes.RoutePlanner.errors.no_itineraries'));
			}
		} catch (caughtError) {
			const message = caughtError instanceof Error ? caughtError.message : t('default:routes.RoutePlanner.errors.unknown');
			setPlanError(message);
		} finally {
			setIsPlanning(false);
		}
	};

	//
	// D. Render components

	return (
		<BottomSheet
			onClose={closeActiveBottomSheet}
			opened={activeBottomSheet?.view === 'routes'}
			size="full"
			title={t('default:routes.RoutePlanner.title')}
		>
			<div className={styles.inputWrapper}>
				<RoutePlannerInput
					destination={destination}
					onDestinationChange={setDestination}
					onOriginChange={setOrigin}
					onSwap={handleSwap}
					onTravelTimeChange={handleTravelTimeChange}
					onTravelTimeModeChange={handleTravelTimeModeChange}
					origin={origin}
					travelTime={travelTime}
				/>
			</div>

			<button
				className={styles.planButton}
				disabled={isPlanning || !origin || !destination}
				onClick={handlePlanRoute}
				type="button"
			>
				{isPlanning ? t('default:routes.RoutePlanner.actions.planning') : t('default:routes.RoutePlanner.actions.plan')}
			</button>

			{planError && <div className={styles.planError}>{planError}</div>}

			{itineraries.length > 0 && (
				<div className={styles.itineraries}>
					<h3 className={styles.itinerariesTitle}>{t('default:routes.RoutePlanner.results.best_alternatives')}</h3>
					{itineraries.map((itinerary, index) => (
						<RoutePlannerItineraryCard
							key={`${itinerary.startTime || itinerary.departureTime || index}-${itinerary.endTime || itinerary.arrivalTime || index}`}
							index={index}
							itinerary={itinerary}
						/>
					))}
				</div>
			)}
		</BottomSheet>
	);

	//
}
