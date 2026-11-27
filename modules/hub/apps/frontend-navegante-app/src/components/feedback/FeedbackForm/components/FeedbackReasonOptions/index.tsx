'use client';

import { type FeedbackEntityType, type FeedbackReasonCategory, getFeedbackReasonGroups } from '@/components/feedback/feedback-config';
import { toggleFeedbackReason } from '@/utils/feedback/selection';
import { PUBLIC_FEEDBACK_V2_COMMENT_MAX_LENGTH, type PublicFeedbackV2Reason } from '@tmlmobilidade/go-types-hub';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface FeedbackReasonOptionsProps {
	category: FeedbackReasonCategory
	comment: string
	entityType: FeedbackEntityType
	onChange: (values: PublicFeedbackV2Reason[]) => void
	onCommentChange: (value: string) => void
	selectedValues: PublicFeedbackV2Reason[]
}

/* * */

export function FeedbackReasonOptions({ category, comment, entityType, onChange, onCommentChange, selectedValues }: FeedbackReasonOptionsProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const reasonOptionsId = useId();
	const reasonGroup = getFeedbackReasonGroups(
		entityType,
		reasonCategory => t(`default:feedback.categories.${reasonCategory}`),
		reasonId => t(`default:feedback.reasons.${reasonId}`),
	)[category];

	//
	// B. Handle actions

	const handleToggleReason = (reasonValue: PublicFeedbackV2Reason) => {
		onChange(toggleFeedbackReason(selectedValues, reasonValue));
	};

	//
	// C. Render components

	if (!reasonGroup) return null;

	return (
		<div className={styles.container}>
			<p className={styles.description}>{t('default:feedback.form.reasons_prompt')}</p>

			<div className={styles.options}>
				{reasonGroup.options.map((option) => {
					const isSelected = selectedValues.includes(option.value);
					const optionId = `${reasonOptionsId}-${option.value}`;

					return (
						<label key={option.value} className={styles.option} data-selected={isSelected} htmlFor={optionId}>
							<input
								checked={isSelected}
								id={optionId}
								onChange={() => handleToggleReason(option.value)}
								type="checkbox"
								value={option.value}
							/>
							<span>{option.label}</span>
						</label>
					);
				})}
				<label className={styles.comment} htmlFor={`${reasonOptionsId}-comment`}>
					<span className={styles.commentLabel}>
						{t('default:feedback.form.FeedbackReasonOptions.comment_label')}
					</span>
					<input
						className={styles.commentInput}
						data-selected={comment.trim().length > 0}
						id={`${reasonOptionsId}-comment`}
						maxLength={PUBLIC_FEEDBACK_V2_COMMENT_MAX_LENGTH}
						onChange={event => onCommentChange(event.target.value)}
						placeholder={t('default:feedback.form.FeedbackReasonOptions.comment_placeholder', { count: PUBLIC_FEEDBACK_V2_COMMENT_MAX_LENGTH })}
						type="text"
						value={comment}
					/>
				</label>
			</div>
		</div>
	);
}
