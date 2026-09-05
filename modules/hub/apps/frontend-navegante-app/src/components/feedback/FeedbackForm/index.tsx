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
import { type FeedbackSheetView, getFeedbackBackTarget, getFeedbackReasonSelectionTarget, hasFeedbackTarget, shouldShowFeedbackTrigger } from '@/utils/feedback/navigation';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PublicFeedbackReason, type PublicFeedbackSubmission } from '@tmlmobilidade/go-types-hub';
import { AlertMessage } from '@tmlmobilidade/ui';
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

const FEEDBACK_ENDPOINT = API_ROUTES.hub.FEEDBACK_LIST;

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
	const [hasSubmissionError, setHasSubmissionError] = useState(false);
	const [selectedReasonValues, setSelectedReasonValues] = useState<PublicFeedbackReason[]>([]);
	const [selectedMood, setSelectedMood] = useState<null | PublicFeedbackSubmission['mood']>(null);
	const [triggerPortalRoot, setTriggerPortalRoot] = useState<HTMLElement | null>(null);

	const reasonCategories: readonly FeedbackReasonCategory[] = getFeedbackReasonCategories(entityType);
	const reasonGroups = getFeedbackReasonGroups(
		entityType,
		category => t(`default:feedback.categories.${category}`),
		reasonId => t(`default:feedback.reasons.${reasonId}`),
	);
	const activeReasonGroup = activeCategory ? reasonGroups[activeCategory] : null;
	const feedbackCooldown = useFeedbackCooldown(entityType, entityId);
	const isTriggerVisible = shouldShowFeedbackTrigger(activeBottomSheetSnap.snapPoint, isFeedbackSheetOpen, feedbackCooldown.isCoolingDown);
	const sheetTitle = activeView === 'categories'
		? t(selectedMood === 'unhappy' ? 'default:feedback.form.categories_unhappy_title' : 'default:feedback.form.categories_happy_title')
		: activeView === 'reasons'
			? activeReasonGroup?.heading ?? t('default:feedback.form.title')
			: t('default:feedback.form.title');
	const canNavigateBack = activeView === 'categories' || activeView === 'reasons';
	const canSubmitReasons = selectedReasonValues.length > 0 && !isSubmitting;

	//
	// B. Handle actions

	const resetFeedbackForm = () => {
		setActiveCategory(null);
		setActiveView('mood');
		setHasSubmissionError(false);
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

	const submitFeedback = async (feedbackMood: null | PublicFeedbackSubmission['mood'], feedbackReasonValues: PublicFeedbackReason[]) => {
		if (!entityId || !feedbackMood || isSubmitting) return;
		if (entityType === 'line' && !agencyId) return;

		const commonPayload = {
			entity_id: entityId,
			mood: feedbackMood,
			reasons: feedbackReasonValues,
			schema_version: 'v1',
		} as const;

		const payload: PublicFeedbackSubmission = entityType === 'line'
			? { ...commonPayload, agency_id: agencyId, entity_type: 'line' }
			: { ...commonPayload, entity_type: 'stop' };

		setHasSubmissionError(false);
		setIsSubmitting(true);

		try {
			const response = await fetch(FEEDBACK_ENDPOINT, {
				body: JSON.stringify(payload),
				headers: { 'Content-Type': 'application/json' },
				method: 'POST',
			});

			if (!response.ok) {
				setHasSubmissionError(true);
				return;
			}

			feedbackCooldown.startCooldown();
			setActiveView('thank-you');
		} catch {
			setHasSubmissionError(true);
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

	if (!hasFeedbackTarget(entityType, entityId, agencyId)) return null;

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

				{hasSubmissionError && (
					<div className={styles.error} role="alert">
						<AlertMessage title={t('default:feedback.form.submit_error')} variant="danger" raised />
					</div>
				)}
			</BottomSheet>
		</>
	);

	//
}
