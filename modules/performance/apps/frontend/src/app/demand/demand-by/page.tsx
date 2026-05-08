'use client';

import DemandByTopic from '@/components/dashboards/DemandBy';
import DashboardWrapper from '@/components/layout/DashboardWrapper';
import { TOPICS, TOPICS_REGISTRY } from '@/constants';

/* * */

export default function Page() {
	//

	//
	// A. Setup variables

	const topic = TOPICS_REGISTRY.find(t => t.key === TOPICS.DEMAND);
	const dashboard = topic?.dashboards?.find(d => d.key === 'demand-by');

	//
	// C. Render components

	return (
		<DashboardWrapper
			dashboard={dashboard}
			topic={topic}
		>
			<DemandByTopic />
		</DashboardWrapper>
	);
}
