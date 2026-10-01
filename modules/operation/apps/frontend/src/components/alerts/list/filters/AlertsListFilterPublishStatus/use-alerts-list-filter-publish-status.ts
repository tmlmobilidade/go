'use client';

import { type PublishStatus, PublishStatusValues } from '@tmlmobilidade/go-types-shared';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage the reference type filter for the alerts list filter bar.
 * @returns The filter state management object.
 */
export function useAlertsListFilterPublishStatus(): UseFilterStateListReturnType<PublishStatus> {
	//

	const { t } = useTranslation();

	const selectOptions = useMemo(() =>
		PublishStatusValues.map(item => ({
			label: t(`shared:status.publish_status.${item}`),
			value: item,
		})),
	[t]);

	return useFilterStateList(
		'publish_status',
		[...PublishStatusValues],
		selectOptions,
	);
}
