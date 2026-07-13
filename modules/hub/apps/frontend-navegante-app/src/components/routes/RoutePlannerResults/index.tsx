'use client';

import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { RoutePlannerItineraryCard } from '@/components/routes/RoutePlannerItineraryCard';
import { getMotisItineraryDurationSeconds, getMotisItineraryWalkMinutes, getMotisLegModeKind, getMotisTransfersCount, isMotisWalkingLeg, type MotisItinerary } from '@/utils/route-planner-motis';
import { IconBus, IconFerry, IconRoute, IconSortAscending, IconTrain, IconWalk } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

type RoutePlannerModeFilter = 'bus' | 'ferry' | 'rail' | 'subway' | 'tram' | 'transit';
type RoutePlannerOpenFilter = 'modes' | 'sort';
type RoutePlannerSortMode = 'best' | 'fastest' | 'fewer_transfers' | 'least_walking';

interface RoutePlannerFilterOption<TValue extends string> {
	icon: typeof IconRoute
	value: TValue
}

interface RoutePlannerVisibleItinerary {
	index: number
	itinerary: MotisItinerary
}

/* * */

const MODE_FILTER_OPTIONS: RoutePlannerFilterOption<RoutePlannerModeFilter>[] = [
	{ icon: IconBus, value: 'bus' },
	{ icon: IconTrain, value: 'rail' },
	{ icon: IconTrain, value: 'subway' },
	{ icon: IconTrain, value: 'tram' },
	{ icon: IconFerry, value: 'ferry' },
	{ icon: IconRoute, value: 'transit' },
];

const SORT_OPTIONS: RoutePlannerFilterOption<RoutePlannerSortMode>[] = [
	{ icon: IconSortAscending, value: 'best' },
	{ icon: IconSortAscending, value: 'fastest' },
	{ icon: IconRoute, value: 'fewer_transfers' },
	{ icon: IconWalk, value: 'least_walking' },
];

/* * */

export function RoutePlannerResults() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const routePlannerContext = useRoutePlannerContext();
	const [enabledModes, setEnabledModes] = useState<Set<RoutePlannerModeFilter>>(() => {
		return new Set(MODE_FILTER_OPTIONS.map(option => option.value));
	});
	const [openFilter, setOpenFilter] = useState<null | RoutePlannerOpenFilter>(null);
	const [sortMode, setSortMode] = useState<RoutePlannerSortMode>('best');
	const previousFirstVisibleItineraryIndexRef = useRef<null | number>(null);

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
		if (previousFirstVisibleItineraryIndexRef.current === firstVisibleItinerary.index) return;

		previousFirstVisibleItineraryIndexRef.current = firstVisibleItinerary.index;
		if (routePlannerContext.data.selected_itinerary_index === firstVisibleItinerary.index) return;

		routePlannerContext.actions.selectItinerary(firstVisibleItinerary.index);
	}, [routePlannerContext.actions, routePlannerContext.data.selected_itinerary_index, visibleItineraries]);

	//
	// D. Handle actions

	const handleModeToggle = (mode: RoutePlannerModeFilter) => {
		setEnabledModes((current) => {
			const next = new Set(current);
			if (next.has(mode)) next.delete(mode);
			else next.add(mode);

			return next.size > 0 ? next : current;
		});
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

			{routePlannerContext.data.itineraries.length > 0 && (
				<div className={styles.itineraries}>
					<div className={styles.filterToggles}>
						<button
							aria-expanded={openFilter === 'sort'}
							className={styles.filtersToggle}
							data-active={sortMode !== 'best' || openFilter === 'sort'}
							onClick={() => setOpenFilter(current => current === 'sort' ? null : 'sort')}
							type="button"
						>
							<IconSortAscending size={15} />
							{t(`default:routes.RoutePlanner.results.sort.${sortMode}`)}
						</button>

						<button
							aria-expanded={openFilter === 'modes'}
							className={styles.filtersToggle}
							data-active={disabledModesCount > 0 || openFilter === 'modes'}
							onClick={() => setOpenFilter(current => current === 'modes' ? null : 'modes')}
							type="button"
						>
							<IconRoute size={15} />
							{t('default:routes.RoutePlanner.results.modes.label')}
							{disabledModesCount > 0 && <span>{disabledModesCount}</span>}
						</button>
					</div>

					{openFilter === 'sort' && (
						<div className={styles.filtersPanel}>
							<div className={styles.filterSection}>
								<strong>{t('default:routes.RoutePlanner.results.sort.label')}</strong>
								<div className={styles.filterGroup}>
									{SORT_OPTIONS.map((option) => {
										const FilterIcon = option.icon;

										return (
											<button
												key={option.value}
												className={styles.filterButton}
												data-active={sortMode === option.value}
												onClick={() => handleSortModeChange(option.value)}
												type="button"
											>
												<FilterIcon size={14} />
												{t(`default:routes.RoutePlanner.results.sort.${option.value}`)}
											</button>
										);
									})}
								</div>
							</div>
						</div>
					)}

					{openFilter === 'modes' && (
						<div className={styles.filtersPanel}>
							<div className={styles.filterSection}>
								<strong>{t('default:routes.RoutePlanner.results.modes.label')}</strong>
								<div className={styles.filterGroup}>
									{MODE_FILTER_OPTIONS.filter(option => availableModes.has(option.value)).map((option) => {
										const FilterIcon = option.icon;

										return (
											<button
												key={option.value}
												className={styles.filterButton}
												data-active={enabledModes.has(option.value)}
												onClick={() => handleModeToggle(option.value)}
												type="button"
											>
												<FilterIcon size={14} />
												{t(`default:routes.RoutePlanner.results.modes.${option.value}`)}
											</button>
										);
									})}
								</div>
							</div>
						</div>
					)}

					{visibleItineraries.map(({ index, itinerary }) => (
						<RoutePlannerItineraryCard
							key={`${itinerary.startTime || itinerary.departureTime || index}-${itinerary.endTime || itinerary.arrivalTime || index}`}
							isSelected={routePlannerContext.data.selected_itinerary_index === index}
							itinerary={itinerary}
							onOpenDetails={() => routePlannerContext.actions.openItineraryDetail(index)}
							onSelect={() => routePlannerContext.actions.selectItinerary(index)}
						/>
					))}
				</div>
			)}
		</div>
	);

	//
}

/* * */

function getItineraryTransitModeFilters(itinerary: MotisItinerary): RoutePlannerModeFilter[] {
	const legs = Array.isArray(itinerary.legs) ? itinerary.legs : [];
	const modes = legs
		.filter(leg => !isMotisWalkingLeg(leg))
		.map(leg => normalizeModeFilter(getMotisLegModeKind(leg)));

	return Array.from(new Set(modes));
}

function itineraryMatchesEnabledModes(itinerary: MotisItinerary, enabledModes: Set<RoutePlannerModeFilter>) {
	const modes = getItineraryTransitModeFilters(itinerary);
	return modes.length === 0 || modes.every(mode => enabledModes.has(mode));
}

function getItineraryTransfersCount(itinerary: MotisItinerary) {
	const legs = Array.isArray(itinerary.legs) ? itinerary.legs : [];
	return getMotisTransfersCount(itinerary.transfers, legs);
}

function getItineraryWalkMinutes(itinerary: MotisItinerary) {
	const legs = Array.isArray(itinerary.legs) ? itinerary.legs : [];
	return getMotisItineraryWalkMinutes(legs);
}

function normalizeModeFilter(mode: string): RoutePlannerModeFilter {
	if (mode === 'bus') return 'bus';
	if (mode === 'ferry') return 'ferry';
	if (mode === 'rail') return 'rail';
	if (mode === 'subway') return 'subway';
	if (mode === 'tram') return 'tram';
	return 'transit';
}

function sortVisibleItineraries(itineraries: RoutePlannerVisibleItinerary[], sortMode: RoutePlannerSortMode) {
	const results = [...itineraries];

	if (sortMode === 'fastest') {
		return results.sort((a, b) => getMotisItineraryDurationSeconds(a.itinerary) - getMotisItineraryDurationSeconds(b.itinerary));
	}

	if (sortMode === 'fewer_transfers') {
		return results.sort((a, b) => getItineraryTransfersCount(a.itinerary) - getItineraryTransfersCount(b.itinerary));
	}

	if (sortMode === 'least_walking') {
		return results.sort((a, b) => getItineraryWalkMinutes(a.itinerary) - getItineraryWalkMinutes(b.itinerary));
	}

	return results;
}
