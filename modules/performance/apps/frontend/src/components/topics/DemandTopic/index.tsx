'use client';

/* * */

import { TopicsWrapper } from '@/components/layout/TopicsWrapper';
import { RecordDemandByDayType } from '@/components/visualizations/RecordDemandByDayType';
import { TopLinesTable } from '@/components/visualizations/TopLinesTable';
import { TOPICS, TOPICS_REGISTRY } from '@/constants';

/* * */

export function DemandTopic() {
	//

	//
	// A. Setup variables

	const topic = TOPICS_REGISTRY.find(t => t.key === TOPICS.DEMAND);

	//
	// B. Render components

	return (
		<TopicsWrapper topic={topic}>
			<RecordDemandByDayType />
			<TopLinesTable />
		</TopicsWrapper>
	);

	//
}
