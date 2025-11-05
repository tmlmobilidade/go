/* * */

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { TopicDefinition, TOPICS_REGISTRY } from '@/constants';
import { Grid } from '@go/ui';
import { useRouter } from 'next/navigation';

import styles from './styles.module.css';

export default function Topics() {
	//

	// A. Setup variables
	const router = useRouter();

	//
	// B. Handle actions

	const handleTopicClick = (topic: TopicDefinition) => {
		router.push(`/performance/${topic.key}`);
	};

	// C. Render components

	return (
		<Grid columns="abcd" gap="lg">
			{TOPICS_REGISTRY.map(topic => (
				<ContainerWrapper key={topic.key} onClick={() => handleTopicClick(topic)}>
					<div className={styles.topicCard}>
						{topic.icon && <topic.icon />}
						<p className={styles.topicCardTitle}>{topic.label}</p>
					</div>
				</ContainerWrapper>
			))}
		</Grid>
	);
}

//
