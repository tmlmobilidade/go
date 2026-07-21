'use client';

import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { RoutePlannerItineraryCard } from '@/components/routes/RoutePlannerItineraryCard';
import { getMotisItineraryDurationSeconds, getMotisItineraryWalkMinutes, getMotisLegModeKind, getMotisTransfersCount, isMotisWalkingLeg, type MotisItinerary, type RoutePlannerTravelTime, type RoutePlannerTravelTimeMode } from '@/utils/route-planner-motis';
import { IconBus, IconClock, IconFerry, IconRoute, IconSortAscending, IconTrain, IconWalk } from '@tabler/icons-react';
import { type TFunction } from 'i18next';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

type RoutePlannerModeFilter = 'bus' | 'ferry' | 'rail' | 'subway' | 'tram' | 'transit';
type RoutePlannerOpenFilter = 'modes' | 'sort' | 'time';
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

	const handleTravelTimeModeChange = (mode: RoutePlannerTravelTimeMode) => {
		const nextTravelTime: RoutePlannerTravelTime = {
			date: mode === 'now' || routePlannerContext.data.travel_time.mode === 'now' ? new Date() : routePlannerContext.data.travel_time.date,
			mode,
		};

		routePlannerContext.actions.setTravelTimeMode(mode);
		void routePlannerContext.actions.planRoute(routePlannerContext.data.origin, routePlannerContext.data.destination, nextTravelTime);

		if (mode === 'now') setOpenFilter(null);
	};

	const handleTravelTimeChange = (value: string) => {
		const parsedDate = new Date(value);
		if (Number.isNaN(parsedDate.getTime())) return;

		const nextTravelTime: RoutePlannerTravelTime = {
			date: parsedDate,
			mode: routePlannerContext.data.travel_time.mode,
		};

		routePlannerContext.actions.setTravelTime(parsedDate);
		void routePlannerContext.actions.planRoute(routePlannerContext.data.origin, routePlannerContext.data.destination, nextTravelTime);
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
					<div className={styles.filterToggles}>
						<button
							aria-expanded={openFilter === 'time'}
							className={styles.filtersToggle}
							data-active={routePlannerContext.data.travel_time.mode !== 'now' || openFilter === 'time'}
							onClick={() => setOpenFilter(current => current === 'time' ? null : 'time')}
							type="button"
						>
							<IconClock size={15} />
							{formatTravelTimeFilterLabel(routePlannerContext.data.travel_time, t)}
						</button>

						{routePlannerContext.data.itineraries.length > 0 && (
							<>
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
							</>
						)}
					</div>

					{openFilter === 'sort' && routePlannerContext.data.itineraries.length > 0 && (
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

					{openFilter === 'time' && (
						<div className={styles.filtersPanel}>
							<div className={styles.filterSection}>
								<strong>{t('default:routes.RoutePlannerInput.time.datetime_label')}</strong>
								<div className={styles.filterGroup}>
									<button
										className={styles.filterButton}
										data-active={routePlannerContext.data.travel_time.mode === 'now'}
										onClick={() => handleTravelTimeModeChange('now')}
										type="button"
									>
										{t('default:routes.RoutePlannerInput.time.now')}
									</button>
									<button
										className={styles.filterButton}
										data-active={routePlannerContext.data.travel_time.mode === 'departure'}
										onClick={() => handleTravelTimeModeChange('departure')}
										type="button"
									>
										{t('default:routes.RoutePlannerInput.time.departure')}
									</button>
									<button
										className={styles.filterButton}
										data-active={routePlannerContext.data.travel_time.mode === 'arrival'}
										onClick={() => handleTravelTimeModeChange('arrival')}
										type="button"
									>
										{t('default:routes.RoutePlannerInput.time.arrival')}
									</button>
								</div>

								{routePlannerContext.data.travel_time.mode !== 'now' && (
									<input
										className={styles.timeInput}
										onChange={event => handleTravelTimeChange(event.currentTarget.value)}
										type="datetime-local"
										value={formatDateForInput(routePlannerContext.data.travel_time.date)}
									/>
								)}
							</div>
						</div>
					)}

					{openFilter === 'modes' && routePlannerContext.data.itineraries.length > 0 && (
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

function formatDateForInput(date: Date) {
	const offset = date.getTimezoneOffset();
	const localDate = new Date(date.getTime() - offset * 60_000);
	return localDate.toISOString().slice(0, 16);
}

function formatTravelTimeFilterLabel(travelTime: RoutePlannerTravelTime, t: TFunction) {
	if (travelTime.mode === 'now') return t('default:routes.RoutePlannerInput.time.now');

	const date = new Intl.DateTimeFormat(undefined, {
		day: '2-digit',
		hour: '2-digit',
		hour12: false,
		minute: '2-digit',
		month: '2-digit',
	}).format(travelTime.date);

	const modeLabel = travelTime.mode === 'arrival'
		? t('default:routes.RoutePlannerInput.time.arrival')
		: t('default:routes.RoutePlannerInput.time.departure');

	return `${modeLabel} ${date}`;
}
