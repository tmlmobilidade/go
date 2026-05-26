'use client';

import TopicsWrapper from '@/components/layout/TopicsWrapper';
import SupplyTopic from '@/components/topics/Supply';
import { TOPICS, TOPICS_REGISTRY } from '@/constants';

/* * */

export default function Page() {
	return (
		<TopicsWrapper topic={TOPICS_REGISTRY.find(t => t.key === TOPICS.SUPPLY)}>
			<SupplyTopic />
		</TopicsWrapper>
	);
}
