/* * */

import Breadcrumb from '@/components/layout/Breadcrumb';
import { DashboardDefinition, TopicDefinition } from '@/constants';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

// Helper to convert kebab-case to snake_case for translation keys
const toSnakeCase = (str: string) => str.replace(/-/g, '_');

export default function DashboardWrapper({ children, dashboard, topic }: { children?: React.ReactNode, dashboard: DashboardDefinition, topic: TopicDefinition }) {
	//

	// A. Setup variables

	const { t } = useTranslation();

	// Convert keys from kebab-case to snake_case for translation lookup
	const topicKey = toSnakeCase(topic.key);
	const dashboardKey = toSnakeCase(dashboard.key);

	const breadcrumbsData = [
		{ href: '/performance', title: t('performance:DashboardWrapper.breadcrumbs.performance') },
		{ href: `/performance/${topic.key}`, title: t(`performance:DashboardWrapper.breadcrumbs.topics.${topicKey}`) },
		{ href: `/performance/${topic.key}/${dashboard.key}`, title: t(`performance:DashboardWrapper.breadcrumbs.dashboards.${dashboardKey}`) },
	];

	// B. Render components

	return (
		<div className={styles.container}>

			<div className={styles.topContainer}>
				<div className={styles.headerContainer}>
					<Breadcrumb items={breadcrumbsData} />

					<div className={styles.headerTitleContainer}>
						<h1 className={styles.headerTitle}>{t(`performance:DashboardWrapper.dashboards.${dashboardKey}`)}</h1>
					</div>

				</div>
			</div>

			{children}

		</div>
	);
}

//
