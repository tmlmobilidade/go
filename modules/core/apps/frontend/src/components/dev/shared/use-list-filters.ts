'use client';

import { type PublishStatus, PublishStatusValues } from '@tmlmobilidade/go-types-shared';
import { useFilterStateList, type UseFilterStateListReturnType, useFilterStateText, type UseFilterStateTextReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

interface UseListFiltersReturnType {
	search: UseFilterStateTextReturnType
	status: UseFilterStateListReturnType<PublishStatus>
}

/* * */

/**
 * Search and publication status filters shared by the banners and changelog lists.
 */
export function useListFilters(): UseListFiltersReturnType {
	//

	const { t } = useTranslation();
	const options = PublishStatusValues.map(value => ({ label: t(`shared:status.publish_status.${value}`), value }));
	const search = useFilterStateText('search');
	const status = useFilterStateList<PublishStatus>('status', [...PublishStatusValues], options);

	return useMemo(() => ({ search, status }), [search, status]);
}
