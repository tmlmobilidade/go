/* * */

import Breadcrumb from '@/components/layout/Breadcrumb';
import { DashboardDefinition, TopicDefinition } from '@/constants';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

export default function DashboardWrapper({ children, dashboard, topic }: { children?: React.ReactNode, dashboard: DashboardDefinition, topic: TopicDefinition }) {
	//

	// A. Setup variables

	const { t } = useTranslation('performance', { keyPrefix: 'DashboardWrapper' });

	const breadcrumbsData = [
		{ href: '/performance', title: t('breadcrumbs.performance') },
		{ href: `/performance/${topic.key}`, title: t(`breadcrumbs.topics.${topic.key}`) },
		{ href: `/performance/${topic.key}/${dashboard.key}`, title: t(`breadcrumbs.dashboards.${dashboard.key}`) },
	];

	// B. Render components

	return (
		<div className={styles.container}>

			<div className={styles.topContainer}>
				<div className={styles.headerContainer}>
					<Breadcrumb items={breadcrumbsData} />

					<div className={styles.headerTitleContainer}>
						<h1 className={styles.headerTitle}>{t(`dashboards.${dashboard.key}`)}</h1>
					</div>

				</div>
			</div>

			{children}

		</div>
	);
}

//
