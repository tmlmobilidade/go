'use client';

import DashboardWrapper from '@/components/layout/DashboardWrapper';
import { FeedbackStops } from '@/components/visualizations/Feedback';
import { DashboardDefinition, TOPICS, TOPICS_REGISTRY } from '@/constants';

/* * */

const FEEDBACK_STOPS_DASHBOARD: DashboardDefinition = {
	key: 'stops',
	label: 'Paragens',
};

/* * */

export default function Page() {
	const topic = TOPICS_REGISTRY.find(t => t.key === TOPICS.FEEDBACK);

	return (
		<DashboardWrapper
			dashboard={FEEDBACK_STOPS_DASHBOARD}
			topic={topic}
		>
			<FeedbackStops />
		</DashboardWrapper>
	);
}

