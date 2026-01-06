/* * */

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { TopicDefinition, TOPICS_REGISTRY } from '@/constants';
import { Grid } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

// Helper to convert kebab-case to snake_case for translation keys
const toSnakeCase = (str: string) => str.replace(/-/g, '_');

export default function Topics() {
	//

	// A. Setup variables
	const router = useRouter();
	const { t } = useTranslation('performance');

	//
	// B. Handle actions

	const handleTopicClick = (topic: TopicDefinition) => {
		router.push(`/${topic.key}`);
	};

	// C. Render components

	return (
		<>
			<h2>{t('Topics.title')}</h2>
			<Grid columns="abcd" gap="lg">
				{TOPICS_REGISTRY.filter(topic => topic.visible).map(topic => (
					<ContainerWrapper key={topic.key} onClick={() => handleTopicClick(topic)}>
						<div className={styles.topicCard}>
							{topic.icon && <topic.icon />}
							<p className={styles.topicCardTitle}>{t(`Topics.topics.${toSnakeCase(topic.key)}`)}</p>
						</div>
					</ContainerWrapper>
				))}
			</Grid>
		</>
	);
}

//
