'use client';

import { type StopEquipment, StopEquipmentValues } from '@tmlmobilidade/go-types-infrastructure';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage the equipment filter for the stops list.
 * @returns The filter state management object.
 */
export function useStopsListFilterEquipment(): UseFilterStateListReturnType<StopEquipment> {
	//

	const { t } = useTranslation();

	const selectOptions = useMemo(() => StopEquipmentValues.map(item => ({
		label: t(`default:stops.shared.stop_equipment.${item}`),
		value: item,
	})), [t]);

	return useFilterStateList('equipment', [...StopEquipmentValues], selectOptions);
}
