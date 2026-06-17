'use client';

import { FeedbackImprovementPrompt } from '@/components/feedback/form/FeedbackImprovementPrompt';
import { FeedbackMoodSelector } from '@/components/feedback/form/FeedbackMoodSelector';
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
	opened: boolean
	selectedMood: null | PublicFeedback['mood']
}

/* * */

export function FeedbackModal({ isAnyReasonsSheetOpen, onClose, onOpenHappyReasonsSheet, onSelectHappy, onSelectUnhappy, opened, selectedMood }: FeedbackModalProps) {
	const [showThankYouMessage, setShowThankYouMessage] = useState(false);
	const previousOpenedRef = useRef(opened);
	const thankYouMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		const wasOpened = previousOpenedRef.current;

		if (wasOpened && !opened) {
			setShowThankYouMessage(true);

			if (thankYouMessageTimeoutRef.current) clearTimeout(thankYouMessageTimeoutRef.current);
			thankYouMessageTimeoutRef.current = setTimeout(() => {
				setShowThankYouMessage(false);
				thankYouMessageTimeoutRef.current = null;
			}, 2000);
		}

		if (opened) {
			setShowThankYouMessage(false);
			if (thankYouMessageTimeoutRef.current) {
				clearTimeout(thankYouMessageTimeoutRef.current);
				thankYouMessageTimeoutRef.current = null;
			}
		}

		previousOpenedRef.current = opened;
	}, [opened]);

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
			</Modal>

			{showThankYouMessage && (
				<div aria-live="polite" className={styles.thankYouMessage} role="status">
					<span className={styles.thankYouIcon}>
						<IconCheck aria-hidden={true} size={18} stroke={2.4} />
					</span>
					<span>Obrigado pelo Feeback!</span>
				</div>
			)}
		</>
	);
}
