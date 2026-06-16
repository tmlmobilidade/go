'use client';

import { type FeedbackEntityType, type FeedbackReasonCategory, getFeedbackReasonGroups } from '@/components/feedback/feedback-reason-options';
import { FeedbackImprovementPrompt } from '@/components/feedback/FeedbackImprovementPrompt';
import { FeedbackMoodSelector } from '@/components/feedback/FeedbackMoodSelector';
import { FeedbackReasonOptionsSheet } from '@/components/feedback/FeedbackReasonOptionsSheet';
import { FeedbackReasonsSheet } from '@/components/feedback/FeedbackReasonsSheet';
import { FeedbackStartPrompt } from '@/components/feedback/FeedbackStartPrompt';
import { Modal } from '@mantine/core';
import { useState } from 'react';

import styles from './styles.module.css';

/* * */

interface FeedbackFormProps {
	entityType?: FeedbackEntityType
}

/* * */

export function FeedbackForm({ entityType = 'line' }: FeedbackFormProps) {
	//

	//
	// A. Setup variables

	const [isHappyReasonsSheetOpen, setIsHappyReasonsSheetOpen] = useState(false);
	const [isUnhappyReasonsSheetOpen, setIsUnhappyReasonsSheetOpen] = useState(false);
	const [activeReasonOptionsSheet, setActiveReasonOptionsSheet] = useState<FeedbackReasonCategory | null>(null);
	const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
	const [selectedReasonValues, setSelectedReasonValues] = useState<string[]>([]);
	const [selectedMood, setSelectedMood] = useState<'happy' | 'unhappy' | null>(null);

	const reasonGroups = getFeedbackReasonGroups(entityType);
	const reasonCategories = Object.keys(reasonGroups) as FeedbackReasonCategory[];
	const isAnyReasonsSheetOpen = isHappyReasonsSheetOpen || isUnhappyReasonsSheetOpen || activeReasonOptionsSheet !== null;

	//
	// B. Handle actions

	const handleOpenReasonSelection = (openReasonsSheet: () => void) => {
		if (reasonCategories.length === 1 && reasonCategories[0]) {
			setActiveReasonOptionsSheet(reasonCategories[0]);
			return;
		}

		openReasonsSheet();
	};

	const handleOpenHappyReasonsSheet = () => {
		handleOpenReasonSelection(() => setIsHappyReasonsSheetOpen(true));
	};

	const handleSelectUnhappy = () => {
		setSelectedMood('unhappy');
		handleOpenReasonSelection(() => setIsUnhappyReasonsSheetOpen(true));
	};

	const handleCloseHappyReasonsSheet = () => {
		setIsHappyReasonsSheetOpen(false);
	};

	const handleCloseReasonOptionsSheet = () => {
		setActiveReasonOptionsSheet(null);
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
				closeOnClickOutside={false}
				onClose={() => setIsFeedbackModalOpen(false)}
				opened={isFeedbackModalOpen}
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
				entityType={entityType}
				heading="O que podemos melhorar?"
				onClose={handleCloseHappyReasonsSheet}
				onSelectCategory={setActiveReasonOptionsSheet}
				opened={isHappyReasonsSheetOpen}
			/>

			<FeedbackReasonsSheet
				description="Ajude-nos a melhorar o serviço."
				entityType={entityType}
				heading="Com o que está insatisfeito?"
				onClose={() => setIsUnhappyReasonsSheetOpen(false)}
				onSelectCategory={setActiveReasonOptionsSheet}
				opened={isUnhappyReasonsSheetOpen}
			/>

			{reasonCategories.map(category => (
				<FeedbackReasonOptionsSheet
					key={category}
					category={category}
					entityType={entityType}
					onClose={handleCloseReasonOptionsSheet}
					onToggleReason={handleToggleReason}
					opened={activeReasonOptionsSheet === category}
					selectedValues={selectedReasonValues}
				/>
			))}
		</>
	);
}
