'use client';

import { type StopConnection, StopConnectionValues } from '@tmlmobilidade/go-types-infrastructure';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage the connections filter for the stops list.
 * @returns The filter state management object.
 */
export function useStopsListFilterConnections(): UseFilterStateListReturnType<StopConnection> {
	//

	const { t } = useTranslation();

	const selectOptions = useMemo(() => StopConnectionValues.map(item => ({
		label: t(`default:stops.shared.stop_connection.${item}`),
		value: item,
	})), [t]);

	return useFilterStateList('connections', [...StopConnectionValues], selectOptions);
}
