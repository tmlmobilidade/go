'use client';

import { RoutePlannerItineraryCard } from '@/components/routes/list/RoutePlannerItineraryCard';
import { type RoutePlannerOpenFilter, RoutePlannerResultsFilters } from '@/components/routes/list/RoutePlannerResultsFilters';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { getItineraryTransitModeFilters, itineraryMatchesEnabledModes, ROUTE_PLANNER_MODE_FILTERS, type RoutePlannerModeFilter, type RoutePlannerSortMode, type RoutePlannerVisibleItinerary, sortVisibleItineraries, toggleRoutePlannerMode } from '@/utils/route-planner-results';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function RoutePlannerResults() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const routePlannerContext = useRoutePlannerContext();
	const [enabledModes, setEnabledModes] = useState<Set<RoutePlannerModeFilter>>(() => {
		return new Set(ROUTE_PLANNER_MODE_FILTERS);
	});
	const [openFilter, setOpenFilter] = useState<null | RoutePlannerOpenFilter>(null);
	const [sortMode, setSortMode] = useState<RoutePlannerSortMode>('best');

	//
	// B. Transform data

	const availableModes = useMemo(() => {
		return new Set(routePlannerContext.data.itineraries.flatMap(getItineraryTransitModeFilters));
	}, [routePlannerContext.data.itineraries]);

	const disabledModesCount = useMemo(() => {
		return Array.from(availableModes).filter(mode => !enabledModes.has(mode)).length;
	}, [availableModes, enabledModes]);

	const visibleItineraries = useMemo(() => {
		const results = routePlannerContext.data.itineraries
			.map((itinerary, index): RoutePlannerVisibleItinerary => ({ index, itinerary }))
			.filter(({ itinerary }) => itineraryMatchesEnabledModes(itinerary, enabledModes));

		return sortVisibleItineraries(results, sortMode);
	}, [enabledModes, routePlannerContext.data.itineraries, sortMode]);

	//
	// C. Handle effects

	useEffect(() => {
		const firstVisibleItinerary = visibleItineraries[0];
		if (!firstVisibleItinerary) return;

		const isSelectedItineraryVisible = visibleItineraries.some(({ index }) => {
			return index === routePlannerContext.data.selected_itinerary_index;
		});

		if (isSelectedItineraryVisible) return;
		routePlannerContext.actions.selectItinerary(firstVisibleItinerary.index);
	}, [routePlannerContext.actions, routePlannerContext.data.selected_itinerary_index, visibleItineraries]);

	//
	// D. Handle actions

	const handleModeToggle = (mode: RoutePlannerModeFilter) => {
		setEnabledModes(current => toggleRoutePlannerMode(current, mode));
	};

	const handleSortModeChange = (mode: RoutePlannerSortMode) => {
		setSortMode(mode);
		setOpenFilter(null);
	};

	//
	// E. Render components

	return (
		<div className={styles.container}>
			{routePlannerContext.flags.is_planning && (
				<div className={styles.status}>{t('default:routes.RoutePlanner.actions.planning')}</div>
			)}

			{routePlannerContext.data.plan_error && (
				<div className={styles.error}>{routePlannerContext.data.plan_error}</div>
			)}

			{routePlannerContext.data.origin && routePlannerContext.data.destination && (
				<div className={styles.itineraries}>
					<RoutePlannerResultsFilters
						availableModes={availableModes}
						disabledModesCount={disabledModesCount}
						enabledModes={enabledModes}
						onModeToggle={handleModeToggle}
						onOpenFilterChange={setOpenFilter}
						onSortModeChange={handleSortModeChange}
						openFilter={openFilter}
						sortMode={sortMode}
					/>

					{visibleItineraries.map(({ index, itinerary }) => (
						<RoutePlannerItineraryCard
							key={`${itinerary.startTime || index}-${itinerary.endTime || index}`}
							isSelected={routePlannerContext.data.selected_itinerary_index === index}
							itinerary={itinerary}
							onSelect={() => routePlannerContext.actions.selectItinerary(index)}
							onStartTrip={() => routePlannerContext.actions.startItinerary(index)}
						/>
					))}
				</div>
			)}
		</div>
	);

	//
}
