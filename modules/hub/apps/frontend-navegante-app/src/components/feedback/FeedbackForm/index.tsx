'use client';

import { FEEDBACK_REASON_SELECTION_LIMIT, type FeedbackEntityType, type FeedbackReasonCategory, getFeedbackReasonGroups } from '@/components/feedback/feedback-config';
import { FeedbackTrigger } from '@/components/feedback/FeedbackButton';
import { FeedbackModal } from '@/components/feedback/FeedbackForm/components/FeedbackModal';
import { FeedbackReasonOptionsSheet } from '@/components/feedback/FeedbackForm/sheets/FeedbackReasonOptionsSheet';
import { FeedbackReasonsSheet } from '@/components/feedback/FeedbackForm/sheets/FeedbackReasonsSheet';
import { useFeedbackCooldown } from '@/components/feedback/use-feedback-cooldown';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PublicFeedback } from '@tmlmobilidade/types';
import { useState } from 'react';

/* * */

interface FeedbackFormProps {
	agencyId?: string
	entityId?: string
	entityType?: FeedbackEntityType
}

const FEEDBACK_ENDPOINT = `${API_ROUTES.hub.BASE}/v1/feedback`;

/* * */

export function FeedbackForm({ agencyId, entityId, entityType = 'line' }: FeedbackFormProps) {
	//

	//
	// A. Setup variables

	const [isHappyReasonsSheetOpen, setIsHappyReasonsSheetOpen] = useState(false);
	const [isUnhappyReasonsSheetOpen, setIsUnhappyReasonsSheetOpen] = useState(false);
	const [activeReasonOptionsSheet, setActiveReasonOptionsSheet] = useState<FeedbackReasonCategory | null>(null);
	const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
	const [selectedReasonValues, setSelectedReasonValues] = useState<string[]>([]);
	const [selectedMood, setSelectedMood] = useState<null | PublicFeedback['mood']>(null);
	const [thankYouMessageKey, setThankYouMessageKey] = useState(0);

	const reasonGroups = getFeedbackReasonGroups(entityType, agencyId);
	const reasonCategories = Object.keys(reasonGroups) as FeedbackReasonCategory[];
	const isAnyReasonsSheetOpen = isHappyReasonsSheetOpen || isUnhappyReasonsSheetOpen || activeReasonOptionsSheet !== null;
	const feedbackCooldown = useFeedbackCooldown(entityType === 'line' ? entityId : undefined);

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
			if (currentValue.length >= FEEDBACK_REASON_SELECTION_LIMIT) return currentValue;

			return [...currentValue, reasonValue];
		});
	};

	const submitFeedback = async (feedbackMood: null | PublicFeedback['mood'], feedbackReasonValues: string[]) => {
		if (!agencyId || !entityId || !feedbackMood) return;

		const payload: PublicFeedback = {
			agency_id: agencyId,
			created_at: Date.now() as PublicFeedback['created_at'],
			entity_id: entityId,
			entity_type: entityType,
			mood: feedbackMood,
			reasons: feedbackReasonValues,
			schema_version: 'v1',
		};

		const response = await fetch(FEEDBACK_ENDPOINT, {
			body: JSON.stringify(payload),
			headers: { 'Content-Type': 'application/json' },
			method: 'POST',
		});

		if (!response.ok) return;

		feedbackCooldown.startCooldown();
		setThankYouMessageKey(currentValue => currentValue + 1);
	};

	const handleCloseFeedbackModal = () => {
		const feedbackMood = selectedMood;
		const feedbackReasonValues = selectedReasonValues;

		setIsFeedbackModalOpen(false);
		setIsHappyReasonsSheetOpen(false);
		setIsUnhappyReasonsSheetOpen(false);
		setActiveReasonOptionsSheet(null);
		setSelectedMood(null);
		setSelectedReasonValues([]);

		void submitFeedback(feedbackMood, feedbackReasonValues);
	};

	//
	// C. Render component

	return (
		<>
			{!feedbackCooldown.isCoolingDown && (
				<FeedbackTrigger onClick={() => setIsFeedbackModalOpen(true)} />
			)}

			<FeedbackModal
				isAnyReasonsSheetOpen={isAnyReasonsSheetOpen}
				onClose={handleCloseFeedbackModal}
				onOpenHappyReasonsSheet={handleOpenHappyReasonsSheet}
				onSelectHappy={() => setSelectedMood('happy')}
				onSelectUnhappy={handleSelectUnhappy}
				onSubmit={handleCloseFeedbackModal}
				opened={isFeedbackModalOpen}
				selectedMood={selectedMood}
				thankYouMessageKey={thankYouMessageKey}
			/>

			<FeedbackReasonsSheet
				agencyId={agencyId}
				description="Ajude-nos a melhorar o serviço."
				entityType={entityType}
				heading="O que podemos melhorar?"
				onClose={handleCloseHappyReasonsSheet}
				onSelectCategory={setActiveReasonOptionsSheet}
				opened={isHappyReasonsSheetOpen}
			/>

			<FeedbackReasonsSheet
				agencyId={agencyId}
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
					agencyId={agencyId}
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
