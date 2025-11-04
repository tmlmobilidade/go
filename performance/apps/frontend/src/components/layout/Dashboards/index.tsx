/* * */

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { DashboardDefinition, TopicDefinition } from '@/constants';
import { Grid } from '@tmlmobilidade/ui';
import { usePathname, useRouter } from 'next/navigation';

import styles from './styles.module.css';

export default function Dashboards({ topic }: { topic: TopicDefinition }) {
	//

	// A. Setup variables
	const router = useRouter();
	const pathname = usePathname();

	//
	// B. Handle actions

	const handleDashboardClick = (dashboard: DashboardDefinition) => {
		router.push(`${pathname}/${dashboard.key}`);
	};

	// C. Render components

	return (
		<Grid columns="abcd" gap="lg">
			{topic.dashboards.map(dashboard => (
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
