'use client';

import { type FeedbackEntityType, type FeedbackReasonCategory, getFeedbackReasonGroups } from '@/components/feedback/feedback-config';
import { toggleFeedbackReason } from '@/utils/feedback/selection';
import { type PublicFeedbackReason } from '@tmlmobilidade/go-types-public-info';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface FeedbackReasonOptionsProps {
	category: FeedbackReasonCategory
	entityType: FeedbackEntityType
	onChange: (values: PublicFeedbackReason[]) => void
	selectedValues: PublicFeedbackReason[]
}

/* * */

export function FeedbackReasonOptions({ category, entityType, onChange, selectedValues }: FeedbackReasonOptionsProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const reasonGroup = getFeedbackReasonGroups(
		entityType,
		reasonCategory => t(`default:feedback.categories.${reasonCategory}`),
		reasonId => t(`default:feedback.reasons.${reasonId}`),
	)[category];

	//
	// B. Handle actions

	const handleToggleReason = (reasonValue: PublicFeedbackReason) => {
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

					return (
						<label key={option.value} className={styles.option} data-selected={isSelected}>
							<input
								checked={isSelected}
								onChange={() => handleToggleReason(option.value)}
								type="checkbox"
								value={option.value}
							/>
							<span>{option.label}</span>
						</label>
					);
				})}
			</div>
		</div>
	);
}
