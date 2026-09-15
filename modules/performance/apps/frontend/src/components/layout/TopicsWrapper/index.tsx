/* * */

import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Dashboards } from '@/components/layout/Dashboards';
import { type TopicDefinition } from '@/constants';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Divider } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function TopicsWrapper({ children, topic }: { children?: React.ReactNode, topic: TopicDefinition }) {
	//

	// A. Setup variables

	const breadcrumbsData = [
		{ href: PAGE_ROUTES.performance.BASE, title: 'Performance' },
		{ href: topic.route ?? '', title: topic.label },
	];

	const hasDashboards = topic.dashboards.filter(dashboard => dashboard.visible).length > 0;

	// B. Render components

	return (
		<div className={styles.container}>

			<div className={styles.topContainer}>
				<div className={styles.headerContainer}>
					<Breadcrumb items={breadcrumbsData} />

					<div className={styles.headerTitleContainer}>
						{topic.icon && <topic.icon />}
						<h1 className={styles.headerTitle}>{topic.label}</h1>
					</div>

					<p>{topic.description}</p>
				</div>
			</div>

			{children}

			{hasDashboards && (
				<>
					<Divider />
					<h2>Dashboards</h2>
					<Dashboards topic={topic} />
				</>
			)}
		</div>
	);
}

//
