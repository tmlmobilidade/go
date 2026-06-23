'use client';

import DashboardWrapper from '@/components/layout/DashboardWrapper';
import { FeedbackLines } from '@/components/visualizations/Feedback';
import { DashboardDefinition, TOPICS, TOPICS_REGISTRY } from '@/constants';

/* * */

const FEEDBACK_LINES_DASHBOARD: DashboardDefinition = {
	key: 'lines',
	label: 'Linhas',
};

/* * */

export default function Page() {
	const topic = TOPICS_REGISTRY.find(t => t.key === TOPICS.FEEDBACK);

	return (
		<DashboardWrapper
			dashboard={FEEDBACK_LINES_DASHBOARD}
			topic={topic}
		>
			<FeedbackLines />
		</DashboardWrapper>
	);
}

