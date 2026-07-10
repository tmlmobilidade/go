/* * */

'use client';

import type { FeedbackEntityType } from '@/utils/metrics/feedback-metrics';
import type { PublicFeedback } from '@tmlmobilidade/go-types-performance';

import { useFeedbackOperatorFilter } from '@/hooks/feedback/use-feedback-operator-filter';
import { Routes } from '@/routes';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';

/* * */

interface FeedbackOperatorFilterButtonProps {
	entityType?: 'all' | FeedbackEntityType
}

/* * */

export function FeedbackOperatorFilterButton({ entityType = 'all' }: FeedbackOperatorFilterButtonProps) {
	const t = useTranslations();
	const { data } = useSWR<PublicFeedback[]>(Routes.FEEDBACK_PREVIEW);
	const operatorFilter = useFeedbackOperatorFilter(data, entityType);

	return (
		<FilterTypeList
			active={operatorFilter.isActive}
			label={t('feedback.labels.operator')}
			onChange={operatorFilter.onChange}
			options={operatorFilter.options}
			isMultiple
			withToggleAll
		/>
	);
}
