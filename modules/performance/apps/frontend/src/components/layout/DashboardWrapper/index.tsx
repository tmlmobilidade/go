/* * */

import Breadcrumb from '@/components/layout/Breadcrumb';
import { Widget } from '@/components/layout/Widget';
import { DashboardDefinition, TopicDefinition } from '@/constants';

import styles from './styles.module.css';

export default function DashboardWrapper({ children, dashboard, topic }: { children?: React.ReactNode, dashboard: DashboardDefinition, topic: TopicDefinition }) {
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

				<Widget />
			</div>

			{children}

		</div>
	);
}

//
