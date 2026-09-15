/* * */

import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { type DashboardDefinition, type TopicDefinition } from '@/constants';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';

import styles from './styles.module.css';

/* * */

export function DashboardWrapper({ children, dashboard, topic }: { children?: React.ReactNode, dashboard: DashboardDefinition, topic: TopicDefinition }) {
	//

	// A. Setup variables

	const breadcrumbsData = [
		{ href: PAGE_ROUTES.performance.BASE, title: 'Performance' },
		{ href: topic.route ?? '', title: topic.label },
		{ href: dashboard.route ?? '', title: dashboard.label },
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
			</div>

			{children}

		</div>
	);
}

//
