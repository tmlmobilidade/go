/* * */

import Breadcrumb from '@/components/layout/Breadcrumb';
import Dashboards from '@/components/layout/Dashboards';
import { TopicDefinition } from '@/constants';
import { Divider } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

export default function TopicsWrapper({ children, topic }: { children?: React.ReactNode, topic: TopicDefinition }) {
	//

	// A. Setup variables

	const breadcrumbsData = [
		{ href: '/performance', title: 'Performance' },
		{ href: topic.key, title: topic.label },
	];

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

			<Divider />

			<h2>Dashboards</h2>
			<Dashboards topic={topic} />
		</div>
	);
}

//
