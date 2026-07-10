'use client';

import { FeedbackLines } from '@/components/dashboards/Feedback/AllLines';
import DashboardWrapper from '@/components/layout/DashboardWrapper';
import { FeedbackOperatorFilterButton } from '@/components/topics/Feedback/components/FeedbackOperatorFilterButton';
import { type DashboardDefinition, type TopicDefinition, TOPICS, TOPICS_REGISTRY } from '@/constants';
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
	const feedbackLinesDashboard: DashboardDefinition = {
		key: 'lines',
		label: t('feedback.labels.lines'),
	};

	return (
		<FeedbackOperatorFilterContextProvider>
			<DashboardWrapper
				actions={<FeedbackOperatorFilterButton entityType="line" />}
				dashboard={feedbackLinesDashboard}
				topic={translatedTopic}
			>
				<FeedbackLines />
			</DashboardWrapper>
		</FeedbackOperatorFilterContextProvider>
	);
}
