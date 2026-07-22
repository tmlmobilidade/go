'use client';

import { RoutePlannerFilterButton } from '@/components/routes/list/RoutePlannerFilterButton';
import { RoutePlannerModeFilter } from '@/components/routes/list/RoutePlannerModeFilter';
import { RoutePlannerSortFilter } from '@/components/routes/list/RoutePlannerSortFilter';
import { RoutePlannerTimeFilter } from '@/components/routes/list/RoutePlannerTimeFilter';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { type RoutePlannerTravelTime } from '@/types/route-planner';
import { type RoutePlannerModeFilter as RoutePlannerModeFilterValue, type RoutePlannerSortMode } from '@/utils/route-planner/results';
import { IconClock, IconRoute, IconSortAscending } from '@tabler/icons-react';
import { type TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export type RoutePlannerOpenFilter = 'modes' | 'sort' | 'time';

interface RoutePlannerResultsFiltersProps {
	availableModes: Set<RoutePlannerModeFilterValue>
	disabledModesCount: number
	enabledModes: Set<RoutePlannerModeFilterValue>
	onModeToggle: (mode: RoutePlannerModeFilterValue) => void
	onOpenFilterChange: (filter: null | RoutePlannerOpenFilter) => void
	onSortModeChange: (mode: RoutePlannerSortMode) => void
	openFilter: null | RoutePlannerOpenFilter
	sortMode: RoutePlannerSortMode
}

/* * */

export function RoutePlannerResultsFilters({ availableModes, disabledModesCount, enabledModes, onModeToggle, onOpenFilterChange, onSortModeChange, openFilter, sortMode }: RoutePlannerResultsFiltersProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const routePlannerContext = useRoutePlannerContext();
	const hasItineraries = routePlannerContext.data.itineraries.length > 0;

	//
	// B. Render components

	return (
		<>
			<div className={styles.filterToggles}>
				<RoutePlannerFilterButton
					ariaExpanded={openFilter === 'time'}
					isActive={routePlannerContext.data.travel_time.mode !== 'now' || openFilter === 'time'}
					onClick={() => onOpenFilterChange(openFilter === 'time' ? null : 'time')}
					variant="trigger"
				>
					<IconClock size={15} />
					{formatTravelTimeFilterLabel(routePlannerContext.data.travel_time, t)}
				</RoutePlannerFilterButton>

				{hasItineraries && (
					<>
						<RoutePlannerFilterButton
							ariaExpanded={openFilter === 'sort'}
							isActive={sortMode !== 'best' || openFilter === 'sort'}
							onClick={() => onOpenFilterChange(openFilter === 'sort' ? null : 'sort')}
							variant="trigger"
						>
							<IconSortAscending size={15} />
							{t(`default:routes.RoutePlanner.results.sort.${sortMode}`)}
						</RoutePlannerFilterButton>

						<RoutePlannerFilterButton
							ariaExpanded={openFilter === 'modes'}
							isActive={disabledModesCount > 0 || openFilter === 'modes'}
							onClick={() => onOpenFilterChange(openFilter === 'modes' ? null : 'modes')}
							variant="trigger"
						>
							<IconRoute size={15} />
							{t('default:routes.RoutePlanner.results.modes.label')}
							{disabledModesCount > 0 && <span className={styles.filterCount}>{disabledModesCount}</span>}
						</RoutePlannerFilterButton>
					</>
				)}
			</div>

			{openFilter === 'sort' && hasItineraries && (
				<RoutePlannerSortFilter onSortModeChange={onSortModeChange} sortMode={sortMode} />
			)}

			{openFilter === 'time' && <RoutePlannerTimeFilter onClose={() => onOpenFilterChange(null)} />}

			{openFilter === 'modes' && hasItineraries && (
				<RoutePlannerModeFilter
					availableModes={availableModes}
					enabledModes={enabledModes}
					onModeToggle={onModeToggle}
				/>
			)}
		</>
	);

	//
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
