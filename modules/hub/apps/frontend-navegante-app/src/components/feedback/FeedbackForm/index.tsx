'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { type FeedbackEntityType, type FeedbackReasonCategory, getFeedbackReasonCategories, getFeedbackReasonGroups } from '@/components/feedback/feedback-config';
import { FeedbackTrigger } from '@/components/feedback/FeedbackButton';
import { FeedbackImprovementPrompt } from '@/components/feedback/FeedbackForm/components/FeedbackImprovement';
import { FeedbackMoodSelector } from '@/components/feedback/FeedbackForm/components/FeedbackMoodSelector';
import { FeedbackReasonCategories } from '@/components/feedback/FeedbackForm/components/FeedbackReasonCategories';
import { FeedbackReasonOptions } from '@/components/feedback/FeedbackForm/components/FeedbackReasonOptions';
import { FeedbackSubmitButton } from '@/components/feedback/FeedbackForm/components/FeedbackSubmitButton';
import { FeedbackThankYou } from '@/components/feedback/FeedbackForm/components/FeedbackThankYou';
import { useFeedbackCooldown } from '@/components/feedback/use-feedback-cooldown';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { type FeedbackSheetView, getFeedbackBackTarget, getFeedbackReasonSelectionTarget, shouldShowFeedbackTrigger } from '@/utils/feedback/navigation';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PublicFeedback } from '@tmlmobilidade/types';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

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

	const { t } = useTranslation();
	const { activeBottomSheetSnap } = useBottomSheet();

	const [activeCategory, setActiveCategory] = useState<FeedbackReasonCategory | null>(null);
	const [activeView, setActiveView] = useState<FeedbackSheetView>('mood');
	const [isFeedbackSheetOpen, setIsFeedbackSheetOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedReasonValues, setSelectedReasonValues] = useState<string[]>([]);
	const [selectedMood, setSelectedMood] = useState<null | PublicFeedback['mood']>(null);
	const [triggerPortalRoot, setTriggerPortalRoot] = useState<HTMLElement | null>(null);

	const reasonCategories = getFeedbackReasonCategories(entityType) as readonly FeedbackReasonCategory[];
	const reasonGroups = getFeedbackReasonGroups(entityType, reasonId => t(`default:feedback.reasons.${reasonId}`));
	const activeReasonGroup = activeCategory ? reasonGroups[activeCategory] : null;
	const feedbackCooldown = useFeedbackCooldown(entityType === 'line' ? entityId : undefined);
	const isTriggerVisible = shouldShowFeedbackTrigger(activeBottomSheetSnap.snapPoint, isFeedbackSheetOpen, feedbackCooldown.isCoolingDown);
	const sheetTitle = getFeedbackSheetTitle(activeView, activeReasonGroup?.heading, selectedMood);
	const canNavigateBack = activeView === 'categories' || activeView === 'reasons';
	const canSubmitReasons = selectedReasonValues.length > 0 && !isSubmitting;

	//
	// B. Handle actions

	const resetFeedbackForm = () => {
		setActiveCategory(null);
		setActiveView('mood');
		setIsFeedbackSheetOpen(false);
		setIsSubmitting(false);
		setSelectedMood(null);
		setSelectedReasonValues([]);
	};

	const openReasonSelection = () => {
		const nextView = getFeedbackReasonSelectionTarget(reasonCategories.length);

		if (nextView === 'reasons' && reasonCategories[0]) {
			setActiveCategory(reasonCategories[0]);
		}

		setActiveView(nextView);
	};

	const handleBack = () => {
		const nextView = getFeedbackBackTarget(activeView, reasonCategories.length);
		if (!nextView) return;

		if (nextView === 'categories') {
			setActiveCategory(null);
			setActiveView(nextView);
			return;
		}

		setActiveCategory(null);
		setActiveView(nextView);
		setSelectedReasonValues([]);
	};

	const handleSelectCategory = (category: FeedbackReasonCategory) => {
		setActiveCategory(category);
		setSelectedReasonValues([]);
		setActiveView('reasons');
	};

	const handleSelectUnhappy = () => {
		setSelectedMood('unhappy');
		openReasonSelection();
	};

	const submitFeedback = async (feedbackMood: null | PublicFeedback['mood'], feedbackReasonValues: string[]) => {
		if (!agencyId || !entityId || !feedbackMood || isSubmitting) return;

		const payload: PublicFeedback = {
			agency_id: agencyId,
			created_at: Date.now() as PublicFeedback['created_at'],
			entity_id: entityId,
			entity_type: entityType,
			mood: feedbackMood,
			reasons: feedbackReasonValues,
			schema_version: 'v1',
		};

		setIsSubmitting(true);

		try {
			const response = await fetch(FEEDBACK_ENDPOINT, {
				body: JSON.stringify(payload),
				headers: { 'Content-Type': 'application/json' },
				method: 'POST',
			});

			if (!response.ok) {
				console.error({ message: 'Failed to submit feedback.', status: response.status });
				return;
			}

			feedbackCooldown.startCooldown();
			setActiveView('thank-you');
		} catch (error) {
			console.error({ error, message: 'Error submitting feedback.' });
		} finally {
			setIsSubmitting(false);
		}
	};

	//
	// C. Setup effects

	useEffect(() => {
		setTriggerPortalRoot(document.body);
	}, []);

	useEffect(() => {
		if (activeView !== 'thank-you') return;

		const timeout = window.setTimeout(() => {
			resetFeedbackForm();
		}, 2000);

		return () => window.clearTimeout(timeout);
	}, [activeView]);

	//
	// D. Render components

	if (!agencyId || !entityId) return null;

	return (
		<>
			{triggerPortalRoot && isTriggerVisible && createPortal(
				<FeedbackTrigger onClick={() => setIsFeedbackSheetOpen(true)} />,
				triggerPortalRoot,
			)}

			<BottomSheet
				layer="foreground"
				onBack={canNavigateBack ? handleBack : undefined}
				onClose={resetFeedbackForm}
				opened={isFeedbackSheetOpen}
				size="fit"
				syncSnapState={false}
				title={sheetTitle}
				footer={activeView === 'reasons' ? (
					<FeedbackSubmitButton
						disabled={!canSubmitReasons}
						onClick={() => void submitFeedback(selectedMood, selectedReasonValues)}
					/>
				) : undefined}
			>
				{activeView === 'mood' && (
					<div className={styles.moodView}>
						<FeedbackMoodSelector
							onSelectHappy={() => setSelectedMood('happy')}
							onSelectUnhappy={handleSelectUnhappy}
							selectedMood={selectedMood}
						>
							{selectedMood === 'happy' && (
								<FeedbackImprovementPrompt onClick={openReasonSelection} />
							)}
						</FeedbackMoodSelector>

						{selectedMood === 'happy' && (
							<FeedbackSubmitButton
								disabled={isSubmitting}
								onClick={() => void submitFeedback(selectedMood, selectedReasonValues)}
							/>
						)}
					</div>
				)}

				{activeView === 'categories' && (
					<FeedbackReasonCategories
						entityType={entityType}
						onSelect={handleSelectCategory}
					/>
				)}

				{activeView === 'reasons' && activeCategory && (
					<FeedbackReasonOptions
						category={activeCategory}
						entityType={entityType}
						onChange={setSelectedReasonValues}
						selectedValues={selectedReasonValues}
					/>
				)}

				{activeView === 'thank-you' && <FeedbackThankYou />}
			</BottomSheet>
		</>
	);

	//
}

/* * */

function getFeedbackSheetTitle(view: FeedbackSheetView, reasonHeading: string | undefined, selectedMood: null | PublicFeedback['mood']) {
	if (view === 'categories') return selectedMood === 'unhappy' ? 'Com o que está insatisfeito?' : 'O que podemos melhorar?';
	if (view === 'reasons') return reasonHeading ?? 'Feedback';

	return 'Feedback';
}
