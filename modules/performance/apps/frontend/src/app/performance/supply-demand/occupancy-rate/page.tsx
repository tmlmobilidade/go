'use client';

/* * */

import DashboardWrapper from '@/components/layout/DashboardWrapper';
import SupplyDemandTopic from '@/components/topics/SupplyDemand';
import { TOPICS, TOPICS_REGISTRY } from '@/constants';

/* * */

export default function Page() {
	const topic = TOPICS_REGISTRY.find(t => t.key === TOPICS.SUPPLY_DEMAND_ALIGNMENT);
	const dashboard = topic?.dashboards?.find(d => d.key === 'occupancy-rate');

	return (
		<DashboardWrapper
			dashboard={dashboard}
			topic={topic}
		>
			<SupplyDemandTopic />
		</DashboardWrapper>
	);
}
