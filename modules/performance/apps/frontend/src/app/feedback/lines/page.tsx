'use client';

import { FeedbackLines } from '@/components/dashboards/Feedback/AllLines';
import DashboardWrapper from '@/components/layout/DashboardWrapper';
import { FeedbackOperatorFilterButton } from '@/components/topics/Feedback/components/FeedbackOperatorFilterButton';
import { DashboardDefinition, TOPICS, TOPICS_REGISTRY } from '@/constants';
import { FeedbackOperatorFilterContextProvider } from '@/contexts/feedback/FeedbackOperatorFilter.context';

/* * */

const FEEDBACK_LINES_DASHBOARD: DashboardDefinition = {
	key: 'lines',
	label: 'Linhas',
};

/* * */

export default function Page() {
	const topic = TOPICS_REGISTRY.find(t => t.key === TOPICS.FEEDBACK);

	return (
		<FeedbackOperatorFilterContextProvider>
			<DashboardWrapper
				actions={<FeedbackOperatorFilterButton entityType="line" />}
				dashboard={FEEDBACK_LINES_DASHBOARD}
				topic={topic}
			>
				<FeedbackLines />
			</DashboardWrapper>
		</FeedbackOperatorFilterContextProvider>
	);
}
