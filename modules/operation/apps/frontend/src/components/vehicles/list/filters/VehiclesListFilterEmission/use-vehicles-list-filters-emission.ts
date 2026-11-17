'use client';

import { VehicleEmissionValues } from '@tmlmobilidade/go-types-operation';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage the emission filter for the vehicles list filter bar.
 */
export function useVehiclesListFilterEmission(): UseFilterStateListReturnType {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Setup options

	const selectOptions = useMemo(() =>
		VehicleEmissionValues.map(item => ({
			label: t(`vehicle-enums:emission.${item}`),
			value: item,
		})),
	[t]);

	//
	// C. Return filter

	return useFilterStateList('emission', [...VehicleEmissionValues], selectOptions);
}
