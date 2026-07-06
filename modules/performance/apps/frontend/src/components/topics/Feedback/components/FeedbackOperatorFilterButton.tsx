/* * */

'use client';

import type { FeedbackEntityType } from '@/utils/metrics/feedback-metrics';
import type { PublicFeedback } from '@tmlmobilidade/types';

import { useFeedbackOperatorFilter } from '@/hooks/feedback/use-feedback-operator-filter';
import { Routes } from '@/routes';
import { FilterTypeList } from '@tmlmobilidade/ui';
import useSWR from 'swr';

/* * */

interface FeedbackOperatorFilterButtonProps {
	entityType?: 'all' | FeedbackEntityType
}

/* * */

export function FeedbackOperatorFilterButton({ entityType = 'all' }: FeedbackOperatorFilterButtonProps) {
	const { data } = useSWR<PublicFeedback[]>(Routes.FEEDBACK_PREVIEW);
	const operatorFilter = useFeedbackOperatorFilter(data, entityType);

	return (
		<FilterTypeList
			active={operatorFilter.isActive}
			label="Operador"
			onChange={operatorFilter.onChange}
			options={operatorFilter.options}
			isMultiple
			withToggleAll
		/>
	);
}
