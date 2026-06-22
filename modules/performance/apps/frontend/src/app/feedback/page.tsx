'use client';

import TopicsWrapper from '@/components/layout/TopicsWrapper';
import FeedbackTopic from '@/components/topics/Feedback';
import { TOPICS, TOPICS_REGISTRY } from '@/constants';

/* * */

export default function Page() {
	return (
		<TopicsWrapper topic={TOPICS_REGISTRY.find(t => t.key === TOPICS.FEEDBACK)}>
			<FeedbackTopic />
		</TopicsWrapper>
	);
}
