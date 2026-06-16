'use client';

import { IconThumbDown, IconThumbUp } from '@tabler/icons-react';
import { Section, Surface } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

interface FeedbackMoodSelectorProps {
	onSelectHappy: () => void
	onSelectUnhappy: () => void
	selectedMood: 'happy' | 'unhappy' | null
}

/* * */

export function FeedbackMoodSelector({ children, onSelectHappy, onSelectUnhappy, selectedMood }: PropsWithChildren<FeedbackMoodSelectorProps>) {
	return (
		<Surface variant="plain">
			<Section gap="xs">
				<div className={styles.container}>
					<p className={styles.title}>Estás satisfeito com este serviço?</p>

					<div className={styles.actions}>
						<button className={styles.action} data-selected={selectedMood === 'happy'} onClick={onSelectHappy} type="button">
							<IconThumbUp aria-hidden={true} size={20} stroke={2} />
							<span>Sim</span>
						</button>

						<button className={styles.action} data-selected={selectedMood === 'unhappy'} onClick={onSelectUnhappy} type="button">
							<IconThumbDown aria-hidden={true} size={20} stroke={2} />
							<span>Não</span>
						</button>
					</div>

					{children}
				</div>
			</Section>
		</Surface>
	);
}
