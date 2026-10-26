/* * */

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { TopicDefinition, TOPICS_REGISTRY } from '@/constants';
import { Grid, keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import styles from './styles.module.css';

export default function Topics() {
	//

	// A. Setup variables
	const router = useRouter();

	//
	// B. Handle actions

	const handleTopicClick = (topic: TopicDefinition) => {
		if (!topic.href) return;
		router.push(keepUrlParams(topic.href));
	};

	// C. Render components

	return (
		<>
			<h2>Explorar temas</h2>
			<Grid columns="abcd" gap="lg">
				{TOPICS_REGISTRY.filter(topic => topic.visible).map(topic => (
					<ContainerWrapper key={topic.key} onClick={() => handleTopicClick(topic)}>
						<div className={styles.topicCard}>
							{topic.icon && <topic.icon />}
							<p className={styles.topicCardTitle}>{topic.label}</p>
						</div>
					</ContainerWrapper>
				))}
			</Grid>
		</>
	);
}

//
