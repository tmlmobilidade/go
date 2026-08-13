'use client';

import { type TicketingStatus, TicketingStatusSchema } from '@tmlmobilidade/types';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/**
 * Hook to manage the ticketing status filter for the rides list.
 * @returns The filter state management object.
 */
export function useRidesListFilterTicketingStatus(): UseFilterStateListReturnType<TicketingStatus> {
	//

	const selectOptions = useMemo(() => TicketingStatusSchema.options.map(item => ({
		label: item,
		value: item,
	})), []);

	return useFilterStateList(
		'ticketing_status',
		TicketingStatusSchema.options,
		selectOptions,
	);
}
