'use client';

import { VehiclePropulsionValues } from '@tmlmobilidade/go-types-operation';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage the propulsion filter for the vehicles list filter bar.
 */
export function useVehiclesListFilterPropulsion(): UseFilterStateListReturnType {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Setup options

	const selectOptions = useMemo(() =>
		VehiclePropulsionValues.map(item => ({
			label: t(`vehicle-enums:propulsion.${item}`),
			value: item,
		})),
	[t]);

	//
	// C. Return filter

	return useFilterStateList('propulsion', [...VehiclePropulsionValues], selectOptions);
}
