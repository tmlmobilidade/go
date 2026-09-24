'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { RoutePlannerFilterButton } from '@/components/routes/list/RoutePlannerFilterButton';
import { RoutePlannerModeFilter } from '@/components/routes/list/RoutePlannerModeFilter';
import { RoutePlannerSortFilter } from '@/components/routes/list/RoutePlannerSortFilter';
import { RoutePlannerTimeFilter } from '@/components/routes/list/RoutePlannerTimeFilter';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { type RoutePlannerTravelTime } from '@/types/route-planner/models';
import { type RoutePlannerModeFilter as RoutePlannerModeFilterValue, type RoutePlannerSortMode } from '@/utils/route-planner/planning/results';
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
	const sheetTitle = getFilterSheetTitle(openFilter, t);

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

			<BottomSheet
				accessibleTitle={sheetTitle}
				layer="foreground"
				modality="modal"
				onClose={() => onOpenFilterChange(null)}
				opened={openFilter !== null}
				size="fit"
				syncSnapState={false}
				title={sheetTitle}
			>
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
			</BottomSheet>
		</>
	);

	//
}

function getFilterSheetTitle(openFilter: null | RoutePlannerOpenFilter, t: TFunction) {
	if (openFilter === 'time') return t('default:routes.RoutePlannerInput.time.datetime_label');
	if (openFilter === 'sort') return t('default:routes.RoutePlanner.results.sort.label');
	if (openFilter === 'modes') return t('default:routes.RoutePlanner.results.modes.label');
	return '';
}

function formatTravelTimeFilterLabel(travelTime: RoutePlannerTravelTime, t: TFunction) {
	if (travelTime.mode === 'now') return t('default:routes.RoutePlannerInput.time.now');

	const time = new Intl.DateTimeFormat('pt-PT', {
		hour: '2-digit',
		hour12: false,
		minute: '2-digit',
	}).format(travelTime.date);

	const modeLabel = travelTime.mode === 'arrival'
		? t('default:routes.RoutePlannerInput.time.arrival_short')
		: t('default:routes.RoutePlannerInput.time.departure_short');

	if (isSameLocalDay(travelTime.date, new Date())) return `${modeLabel} ${time}`;

	const date = new Intl.DateTimeFormat('pt-PT', {
		day: '2-digit',
		month: '2-digit',
	}).format(travelTime.date);

	return `${modeLabel} ${date} · ${time}`;
}

function isSameLocalDay(firstDate: Date, secondDate: Date) {
	return firstDate.toDateString() === secondDate.toDateString();
}
