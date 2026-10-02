'use client';

import { RoutePlannerFilterButton } from '@/components/routes/list/RoutePlannerFilterButton';
import { RoutePlannerFilterPanel } from '@/components/routes/list/RoutePlannerFilterPanel';
import { type RoutePlannerSortMode } from '@/utils/route-planner/planning/results';
import { IconRoute, IconSortAscending, IconWalk } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

/* * */

interface RoutePlannerSortFilterProps {
	id?: string
	onSortModeChange: (mode: RoutePlannerSortMode) => void
	sortMode: RoutePlannerSortMode
}

interface RoutePlannerSortFilterOption {
	icon: typeof IconRoute
	value: RoutePlannerSortMode
}

const SORT_OPTIONS: RoutePlannerSortFilterOption[] = [
	{ icon: IconSortAscending, value: 'best' },
	{ icon: IconSortAscending, value: 'fastest' },
	{ icon: IconRoute, value: 'fewer_transfers' },
	{ icon: IconWalk, value: 'least_walking' },
];

/* * */

export function RoutePlannerSortFilter({ id, onSortModeChange, sortMode }: RoutePlannerSortFilterProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<RoutePlannerFilterPanel id={id} label={t('default:routes.RoutePlanner.results.sort.label')} selection="single">
			{SORT_OPTIONS.map((option) => {
				const FilterIcon = option.icon;

				return (
					<RoutePlannerFilterButton
						key={option.value}
						isActive={sortMode === option.value}
						name="route-planner-sort"
						onClick={() => onSortModeChange(option.value)}
						selection="radio"
						value={option.value}
					>
						<FilterIcon aria-hidden="true" size={14} />
						{t(`default:routes.RoutePlanner.results.sort.${option.value}`)}
					</RoutePlannerFilterButton>
				);
			})}
		</RoutePlannerFilterPanel>
	);

	//
}
