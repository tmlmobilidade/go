'use client';

import { RoutePlannerItineraryCard } from '@/components/routes/list/RoutePlannerItineraryCard';
import { type RoutePlannerOpenFilter, RoutePlannerResultsFilters } from '@/components/routes/list/RoutePlannerResultsFilters';
import { useRoutePlannerAnnouncer } from '@/components/routes/navigation/RoutePlannerAnnouncer';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { getRoutePlannerItineraryStatusSummary, getRoutePlannerResultsStatus } from '@/utils/route-planner/planning/announcements';
import { getItineraryTransitModeFilters, itineraryMatchesEnabledModes, type RoutePlannerModeFilter, type RoutePlannerSortMode, type RoutePlannerVisibleItinerary, sortVisibleItineraries } from '@/utils/route-planner/planning/results';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RoutePlannerResultsProps {
	enabledModes: Set<RoutePlannerModeFilter>
	isActive: boolean
	onModeToggle: (mode: RoutePlannerModeFilter) => void
	onPreviewItinerary: (index: number) => void
	onSortModeChange: (mode: RoutePlannerSortMode) => void
	sortMode: RoutePlannerSortMode
}

/* * */

export function RoutePlannerResults({ enabledModes, isActive, onModeToggle, onPreviewItinerary, onSortModeChange, sortMode }: RoutePlannerResultsProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const routePlannerContext = useRoutePlannerContext();
	const [openFilter, setOpenFilter] = useState<null | RoutePlannerOpenFilter>(null);
	const announce = useRoutePlannerAnnouncer();
	const previousSelectedIndexRef = useRef<null | number>(null);
	const previousVisibleCountRef = useRef<null | number>(null);
	const userSelectedItineraryRef = useRef(false);

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

	const selectedVisibleItinerary = visibleItineraries.find(({ index }) => {
		return index === routePlannerContext.data.selected_itinerary_index;
	});
	const selectedSummary = selectedVisibleItinerary
		? getRoutePlannerItineraryStatusSummary(selectedVisibleItinerary.itinerary, t)
		: null;

	//
	// C. Handle effects

	useEffect(() => {
		if (!isActive) return;
		const firstVisibleItinerary = visibleItineraries[0];
		if (!firstVisibleItinerary) return;

		const isSelectedItineraryVisible = visibleItineraries.some(({ index }) => {
			return index === routePlannerContext.data.selected_itinerary_index;
		});

		if (isSelectedItineraryVisible) return;
		routePlannerContext.actions.selectItinerary(firstVisibleItinerary.index);
	}, [isActive, routePlannerContext.actions, routePlannerContext.data.selected_itinerary_index, visibleItineraries]);

	useEffect(() => {
		if (!isActive) return;
		const status = getRoutePlannerResultsStatus({
			hasEndpoints: Boolean(routePlannerContext.data.origin && routePlannerContext.data.destination),
			isPlanning: routePlannerContext.flags.is_planning,
			planError: routePlannerContext.data.plan_error,
			previousSelectedIndex: previousSelectedIndexRef.current,
			previousVisibleCount: previousVisibleCountRef.current,
			selectedIndex: routePlannerContext.data.selected_itinerary_index,
			selectedSummary,
			selectionCameFromUser: userSelectedItineraryRef.current,
			visibleCount: visibleItineraries.length,
		});
		userSelectedItineraryRef.current = false;

		if (status.type === 'planning') {
			previousVisibleCountRef.current = null;
			return;
		}

		if (status.type === 'idle' && (routePlannerContext.data.plan_error || !routePlannerContext.data.origin || !routePlannerContext.data.destination)) return;

		previousVisibleCountRef.current = visibleItineraries.length;
		previousSelectedIndexRef.current = routePlannerContext.data.selected_itinerary_index;
		if (status.type === 'idle') return;
		if (status.type === 'no_results') announce(t('default:routes.RoutePlanner.results.filtered_no_results'));
		if (status.type === 'result_count') announce(t('default:routes.RoutePlanner.results.result_count', '', { count: status.count }));
		if (status.type === 'selected') announce(t('default:routes.RoutePlanner.results.selected_itinerary_status', '', { summary: status.summary }));
	}, [announce, isActive, routePlannerContext.data.destination, routePlannerContext.data.origin, routePlannerContext.data.plan_error, routePlannerContext.data.selected_itinerary_index, routePlannerContext.flags.is_planning, selectedSummary, t, visibleItineraries.length]);

	//
	// D. Handle actions

	const handleSelectItinerary = (index: number) => {
		userSelectedItineraryRef.current = true;
		onPreviewItinerary(index);
	};

	const handleSortModeChange = (mode: RoutePlannerSortMode) => {
		onSortModeChange(mode);
		setOpenFilter(null);
	};

	//
	// E. Render components

	return (
		<div aria-busy={routePlannerContext.flags.is_planning} className={styles.container}>
			{routePlannerContext.flags.is_planning && (
				<div className={styles.status}>{t('default:routes.RoutePlanner.actions.planning')}</div>
			)}

			{routePlannerContext.data.plan_error && (
				<div className={styles.error} role="alert">{routePlannerContext.data.plan_error}</div>
			)}

			{routePlannerContext.data.origin && routePlannerContext.data.destination && (
				<div className={styles.itineraries}>
					<RoutePlannerResultsFilters
						availableModes={availableModes}
						disabledModesCount={disabledModesCount}
						enabledModes={enabledModes}
						onModeToggle={onModeToggle}
						onOpenFilterChange={setOpenFilter}
						onSortModeChange={handleSortModeChange}
						openFilter={openFilter}
						sortMode={sortMode}
					/>

					<ul className={styles.list}>
						{visibleItineraries.map(({ index, itinerary }) => (
							<li key={index}>
								<RoutePlannerItineraryCard
									isSelected={routePlannerContext.data.selected_itinerary_index === index}
									itinerary={itinerary}
									onSelect={() => handleSelectItinerary(index)}
								/>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);

	//
}
