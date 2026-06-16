'use client';

import { type FeedbackReasonCategory } from '@/components/feedback/feedback-reason-options';
import { FeedbackImprovementPrompt } from '@/components/feedback/FeedbackImprovementPrompt';
import { FeedbackMoodSelector } from '@/components/feedback/FeedbackMoodSelector';
import { FeedbackReasonOptionsSheet } from '@/components/feedback/FeedbackReasonOptionsSheet';
import { FeedbackReasonsSheet } from '@/components/feedback/FeedbackReasonsSheet';
import { FeedbackStartPrompt } from '@/components/feedback/FeedbackStartPrompt';
import { Modal } from '@mantine/core';
import { useState } from 'react';

import styles from './styles.module.css';

/* * */

export function FeedbackForm() {
	//

	//
	// A. Setup variables

	const [isHappyReasonsSheetOpen, setIsHappyReasonsSheetOpen] = useState(false);
	const [isUnhappyReasonsSheetOpen, setIsUnhappyReasonsSheetOpen] = useState(false);
	const [activeReasonOptionsSheet, setActiveReasonOptionsSheet] = useState<FeedbackReasonCategory | null>(null);
	const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
	const [selectedReasonValues, setSelectedReasonValues] = useState<string[]>([]);
	const [selectedMood, setSelectedMood] = useState<'happy' | 'unhappy' | null>(null);

	//
	// B. Handle actions

	const handleOpenHappyReasonsSheet = () => {
		setIsFeedbackModalOpen(false);
		setIsHappyReasonsSheetOpen(true);
	};

	const handleSelectUnhappy = () => {
		setSelectedMood('unhappy');
		setIsFeedbackModalOpen(false);
		setIsUnhappyReasonsSheetOpen(true);
	};

	const handleToggleReason = (reasonValue: string) => {
		setSelectedReasonValues((currentValue) => {
			if (currentValue.includes(reasonValue)) return currentValue.filter(value => value !== reasonValue);
			if (currentValue.length >= 2) return currentValue;

			return [...currentValue, reasonValue];
		});
	};

	//
	// C. Render component

	return (
		<>
			<FeedbackStartPrompt onClick={() => setIsFeedbackModalOpen(true)} />

			<Modal
				centered={true}
				onClose={() => setIsFeedbackModalOpen(false)}
				opened={isFeedbackModalOpen}
				size="sm"
				title="Feedback"
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
					onSelectHappy={() => setSelectedMood('happy')}
					onSelectUnhappy={handleSelectUnhappy}
					selectedMood={selectedMood}
				>
					{selectedMood === 'happy' && (
						<FeedbackImprovementPrompt onClick={handleOpenHappyReasonsSheet} />
					)}
				</FeedbackMoodSelector>
			</Modal>

			<FeedbackReasonsSheet
				description="Ajude-nos a melhorar o serviço."
				heading="Oque podemos melhorar?"
				onClose={() => setIsHappyReasonsSheetOpen(false)}
				onSelectCategory={setActiveReasonOptionsSheet}
				opened={isHappyReasonsSheetOpen}
			/>

			<FeedbackReasonsSheet
				description="Ajude-nos a melhorar o serviço."
				heading="Com o que está insatisfeito?"
				onClose={() => setIsUnhappyReasonsSheetOpen(false)}
				onSelectCategory={setActiveReasonOptionsSheet}
				opened={isUnhappyReasonsSheetOpen}
			/>

			<FeedbackReasonOptionsSheet
				category="line_service"
				onClose={() => setActiveReasonOptionsSheet(null)}
				onToggleReason={handleToggleReason}
				opened={activeReasonOptionsSheet === 'line_service'}
				selectedValues={selectedReasonValues}
			/>

			<FeedbackReasonOptionsSheet
				category="vehicle"
				onClose={() => setActiveReasonOptionsSheet(null)}
				onToggleReason={handleToggleReason}
				opened={activeReasonOptionsSheet === 'vehicle'}
				selectedValues={selectedReasonValues}
			/>

			<FeedbackReasonOptionsSheet
				category="support"
				onClose={() => setActiveReasonOptionsSheet(null)}
				onToggleReason={handleToggleReason}
				opened={activeReasonOptionsSheet === 'support'}
				selectedValues={selectedReasonValues}
			/>
		</>
	);
}
