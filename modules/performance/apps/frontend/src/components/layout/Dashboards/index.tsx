'use client';

/* * */

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { type DashboardDefinition, type TopicDefinition } from '@/constants';
import { Grid, keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import styles from './styles.module.css';

/* * */

export function Dashboards({ topic }: { topic: TopicDefinition }) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	//
	// B. Handle actions

	const handleDashboardClick = (dashboard: DashboardDefinition) => {
		if (!dashboard.route) return;
		router.push(keepUrlParams(dashboard.route));
	};

	// C. Render components

	return (
		<Grid columns="abcd" gap="lg">
			{topic.dashboards.filter(dashboard => dashboard.visible).map(dashboard => (
				<ContainerWrapper key={dashboard.key} onClick={() => handleDashboardClick(dashboard)}>
					<div className={styles.topicCard}>
						{/* {dashboard.icon && <dashboard.icon />} */}
						<p className={styles.topicCardTitle}>{dashboard.label}</p>
					</div>
				</ContainerWrapper>
			))}
		</Grid>
	);
}

//
