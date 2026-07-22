'use client';

import { RoutePlannerFilterButton } from '@/components/routes/list/RoutePlannerFilterButton';
import { RoutePlannerFilterPanel } from '@/components/routes/list/RoutePlannerFilterPanel';
import { type RoutePlannerSortMode } from '@/utils/route-planner-results';
import { IconRoute, IconSortAscending, IconWalk } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

/* * */

interface RoutePlannerSortFilterProps {
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

export function RoutePlannerSortFilter({ onSortModeChange, sortMode }: RoutePlannerSortFilterProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<RoutePlannerFilterPanel label={t('default:routes.RoutePlanner.results.sort.label')}>
			{SORT_OPTIONS.map((option) => {
				const FilterIcon = option.icon;

				return (
					<RoutePlannerFilterButton
						key={option.value}
						isActive={sortMode === option.value}
						onClick={() => onSortModeChange(option.value)}
					>
						<FilterIcon size={14} />
						{t(`default:routes.RoutePlanner.results.sort.${option.value}`)}
					</RoutePlannerFilterButton>
				);
			})}
		</RoutePlannerFilterPanel>
	);

	//
}
