'use client';

import { FeedbackImprovementPrompt } from '@/components/feedback/FeedbackForm/components/FeedbackImprovement';
import { FeedbackMoodSelector } from '@/components/feedback/FeedbackForm/components/FeedbackMoodSelector';
import { FeedbackSubmitButton } from '@/components/feedback/FeedbackForm/components/FeedbackSubmitButton';
import { Modal } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { type PublicFeedback } from '@tmlmobilidade/types';
import { useEffect, useRef, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface FeedbackModalProps {
	isAnyReasonsSheetOpen: boolean
	onClose: () => void
	onOpenHappyReasonsSheet: () => void
	onSelectHappy: () => void
	onSelectUnhappy: () => void
	onSubmit: () => void
	opened: boolean
	selectedMood: null | PublicFeedback['mood']
	thankYouMessageKey: number
}

/* * */

export function FeedbackModal({ isAnyReasonsSheetOpen, onClose, onOpenHappyReasonsSheet, onSelectHappy, onSelectUnhappy, onSubmit, opened, selectedMood, thankYouMessageKey }: FeedbackModalProps) {
	const [showThankYouMessage, setShowThankYouMessage] = useState(false);
	const thankYouMessageTimeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null);

	useEffect(() => {
		if (thankYouMessageKey === 0) return;

		setShowThankYouMessage(true);

		if (thankYouMessageTimeoutRef.current) clearTimeout(thankYouMessageTimeoutRef.current);
		thankYouMessageTimeoutRef.current = setTimeout(() => {
			setShowThankYouMessage(false);
			thankYouMessageTimeoutRef.current = null;
		}, 2000);
	}, [thankYouMessageKey]);

	useEffect(() => {
		return () => {
			if (thankYouMessageTimeoutRef.current) clearTimeout(thankYouMessageTimeoutRef.current);
		};
	}, []);

	return (
		<>
			<Modal
				centered={true}
				closeOnClickOutside={false}
				lockScroll={!isAnyReasonsSheetOpen}
				onClose={onClose}
				opened={opened}
				size="sm"
				title="Feedback"
				zIndex={isAnyReasonsSheetOpen ? 90 : undefined}
				classNames={{
					body: styles.modalBody,
					close: styles.modalClose,
					content: styles.modalContent,
					header: styles.modalHeader,
					overlay: styles.modalOverlay,
					title: styles.modalTitle,
				}}
			>
				<FeedbackMoodSelector
					onSelectHappy={onSelectHappy}
					onSelectUnhappy={onSelectUnhappy}
					selectedMood={selectedMood}
				>
					{selectedMood === 'happy' && (
						<FeedbackImprovementPrompt onClick={onOpenHappyReasonsSheet} />
					)}
				</FeedbackMoodSelector>

				{selectedMood && (
					<FeedbackSubmitButton className={styles.submitButton} onClick={onSubmit} />
				)}
			</Modal>

			<Modal
				centered={true}
				closeOnClickOutside={false}
				closeOnEscape={false}
				lockScroll={false}
				onClose={() => setShowThankYouMessage(false)}
				opened={showThankYouMessage}
				size="xs"
				withCloseButton={false}
				zIndex={500}
				classNames={{
					body: styles.thankYouBody,
					content: styles.thankYouContent,
					overlay: styles.thankYouOverlay,
				}}
			>
				<div aria-live="polite" className={styles.thankYouMessage} role="status">
					<span className={styles.thankYouIcon}>
						<IconCheck aria-hidden={true} size={36} stroke={2.6} />
					</span>
					<span className={styles.thankYouTitle}>Obrigado pelo Feedback!</span>
					<span className={styles.thankYouDescription}>A tua resposta foi enviada.</span>
				</div>
			</Modal>
		</>
	);
}
