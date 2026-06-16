'use client';

import { IconMessageCircle } from '@tabler/icons-react';
import { Section, Surface } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface FeedbackStartPromptProps {
	onClick: () => void
}

/* * */

export function FeedbackStartPrompt({ onClick }: FeedbackStartPromptProps) {
	return (
		<Surface variant="plain">
			<Section gap="xs">
				<button className={styles.container} onClick={onClick} type="button">
					<span className={styles.icon}>
						<IconMessageCircle aria-hidden={true} size={24} stroke={2} />
					</span>
					<span className={styles.label}>Dá-nos o teu feedback!</span>
				</button>
			</Section>
		</Surface>
	);
}
