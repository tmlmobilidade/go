'use client';

import { RoutePlannerFilterButton } from '@/components/routes/list/RoutePlannerFilterButton';
import { RoutePlannerFilterPanel } from '@/components/routes/list/RoutePlannerFilterPanel';
import { type RoutePlannerModeFilter } from '@/utils/route-planner-results';
import { IconBus, IconFerry, IconRoute, IconTrain } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

/* * */

interface RoutePlannerModeFilterProps {
	availableModes: Set<RoutePlannerModeFilter>
	enabledModes: Set<RoutePlannerModeFilter>
	onModeToggle: (mode: RoutePlannerModeFilter) => void
}

interface RoutePlannerModeFilterOption {
	icon: typeof IconRoute
	value: RoutePlannerModeFilter
}

const MODE_FILTER_OPTIONS: RoutePlannerModeFilterOption[] = [
	{ icon: IconBus, value: 'bus' },
	{ icon: IconTrain, value: 'rail' },
	{ icon: IconTrain, value: 'subway' },
	{ icon: IconTrain, value: 'tram' },
	{ icon: IconFerry, value: 'ferry' },
	{ icon: IconRoute, value: 'transit' },
];

export function RoutePlannerModeFilter({ availableModes, enabledModes, onModeToggle }: RoutePlannerModeFilterProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<RoutePlannerFilterPanel label={t('default:routes.RoutePlanner.results.modes.label')}>
			{MODE_FILTER_OPTIONS.filter(option => availableModes.has(option.value)).map((option) => {
				const FilterIcon = option.icon;

				return (
					<RoutePlannerFilterButton
						key={option.value}
						isActive={enabledModes.has(option.value)}
						onClick={() => onModeToggle(option.value)}
					>
						<FilterIcon size={14} />
						{t(`default:routes.RoutePlanner.results.modes.${option.value}`)}
					</RoutePlannerFilterButton>
				);
			})}
		</RoutePlannerFilterPanel>
	);

	//
}
