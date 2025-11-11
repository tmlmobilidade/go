'use client';

/* * */

import TopicsWrapper from '@/components/layout/TopicsWrapper';
import SupplyDemandTopic from '@/components/topics/SupplyDemand';
import { TOPICS, TOPICS_REGISTRY } from '@/constants';

/* * */

export default function Page() {
	return (
		<TopicsWrapper topic={TOPICS_REGISTRY.find(t => t.key === TOPICS.SUPPLY_DEMAND_ALIGNMENT)}>
			<SupplyDemandTopic />
		</TopicsWrapper>
	);
}
