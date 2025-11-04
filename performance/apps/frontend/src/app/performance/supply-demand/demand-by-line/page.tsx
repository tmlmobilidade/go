'use client';

/* * */

import DashboardWrapper from '@/components/layout/DashboardWrapper';
import DemandByLineTopic from '@/components/topics/DemandByLine';
import { TOPICS, TOPICS_REGISTRY } from '@/constants';

/* * */

export default function Page() {
	//

	//
	// A. Setup variables

	const topic = TOPICS_REGISTRY.find(t => t.key === TOPICS.SUPPLY_DEMAND_ALIGNMENT);
	const dashboard = topic?.dashboards?.find(d => d.key === 'demand-by-line');

	//
	// C. Render components

	return (
		<DashboardWrapper
			dashboard={dashboard}
			topic={topic}
		>
			<DemandByLineTopic />
		</DashboardWrapper>
	);
}
