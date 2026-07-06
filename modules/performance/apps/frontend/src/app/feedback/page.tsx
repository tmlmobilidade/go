'use client';

import TopicsWrapper from '@/components/layout/TopicsWrapper';
import FeedbackTopic from '@/components/topics/Feedback';
import { FeedbackOperatorFilterButton } from '@/components/topics/Feedback/components/FeedbackOperatorFilterButton';
import { TOPICS, TOPICS_REGISTRY } from '@/constants';
import { FeedbackOperatorFilterContextProvider } from '@/contexts/FeedbackOperatorFilter.context';

/* * */

export default function Page() {
	return (
		<FeedbackOperatorFilterContextProvider>
			<TopicsWrapper actions={<FeedbackOperatorFilterButton />} topic={TOPICS_REGISTRY.find(t => t.key === TOPICS.FEEDBACK)}>
				<FeedbackTopic />
			</TopicsWrapper>
		</FeedbackOperatorFilterContextProvider>
	);
}
