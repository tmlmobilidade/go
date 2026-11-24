'use client';

import { VehicleTypeValues } from '@tmlmobilidade/go-types-operation';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage the type filter for the vehicles list filter bar.
 */
export function useVehiclesListFilterType(): UseFilterStateListReturnType {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Setup options

	const selectOptions = useMemo(() =>
		VehicleTypeValues.map(item => ({
			label: t(`vehicle-enums:vehicle_type.${item}`),
			value: item,
		})),
	[t]);

	//
	// C. Return filter

	return useFilterStateList('vehicle_type', [...VehicleTypeValues], selectOptions);
}
