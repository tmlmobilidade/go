'use client';

import { FeedbackImprovementPrompt } from '@/components/feedback/form/FeedbackImprovementPrompt';
import { FeedbackMoodSelector } from '@/components/feedback/form/FeedbackMoodSelector';
import { Modal } from '@mantine/core';
import { type PublicFeedback } from '@tmlmobilidade/types';

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
	return (
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
	);
}
