'use client';

import TopicsWrapper from '@/components/layout/TopicsWrapper';
import FeedbackTopic from '@/components/topics/Feedback';
import { FeedbackOperatorFilterButton } from '@/components/topics/Feedback/components/FeedbackOperatorFilterButton';
import { type TopicDefinition, TOPICS, TOPICS_REGISTRY } from '@/constants';
import { FeedbackOperatorFilterContextProvider } from '@/contexts/feedback/FeedbackOperatorFilter.context';
import { useTranslations } from 'next-intl';

/* * */

export default function Page() {
	const t = useTranslations();
	const topic = TOPICS_REGISTRY.find(t => t.key === TOPICS.FEEDBACK) as TopicDefinition;
	const translatedTopic = {
		...topic,
		description: t('feedback.topic.description'),
		label: t('feedback.topic.label'),
	};

	return (
		<FeedbackOperatorFilterContextProvider>
			<TopicsWrapper actions={<FeedbackOperatorFilterButton />} topic={translatedTopic}>
				<FeedbackTopic />
			</TopicsWrapper>
		</FeedbackOperatorFilterContextProvider>
	);
}
