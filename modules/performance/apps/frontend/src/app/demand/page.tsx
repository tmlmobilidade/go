'use client';

import TopicsWrapper from '@/components/layout/TopicsWrapper';
import DemandTopic from '@/components/topics/Demand';
import { TOPICS, TOPICS_REGISTRY } from '@/constants';

/* * */

export default function Page() {
	return (
		<TopicsWrapper topic={TOPICS_REGISTRY.find(t => t.key === TOPICS.DEMAND)}>
			<DemandTopic />
		</TopicsWrapper>
	);
}
