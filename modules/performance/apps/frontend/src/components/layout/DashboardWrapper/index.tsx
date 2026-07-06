/* * */

import Breadcrumb from '@/components/layout/Breadcrumb';
import { DashboardDefinition, TopicDefinition } from '@/constants';

import styles from './styles.module.css';

export default function DashboardWrapper({ actions, children, dashboard, topic }: { actions?: React.ReactNode, children?: React.ReactNode, dashboard: DashboardDefinition, topic: TopicDefinition }) {
	//

	// A. Setup variables

	const breadcrumbsData = [
		{ href: '/performance', title: 'Performance' },
		{ href: `/performance/${topic.key}`, title: topic.label },
		{ href: `/performance/${topic.key}/${dashboard.key}`, title: dashboard.label },
	];

	// B. Render components

	return (
		<div className={styles.container}>

			<div className={styles.topContainer}>
				<div className={styles.headerContainer}>
					<Breadcrumb items={breadcrumbsData} />

					<div className={styles.headerTitleContainer}>
						<h1 className={styles.headerTitle}>{dashboard.label}</h1>
					</div>

				</div>

				{actions && (
					<div className={styles.actionsContainer}>
						{actions}
					</div>
				)}
			</div>

			{children}

		</div>
	);
}

//
