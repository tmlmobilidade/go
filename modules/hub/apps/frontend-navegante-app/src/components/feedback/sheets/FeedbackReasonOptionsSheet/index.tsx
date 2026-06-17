'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { type FeedbackEntityType, type FeedbackReasonCategory, getFeedbackReasonGroups } from '@/components/feedback/feedback-reason-options';

import styles from './styles.module.css';

/* * */

interface FeedbackReasonOptionsSheetProps {
	agencyId?: string
	category: FeedbackReasonCategory
	entityType: FeedbackEntityType
	onClose: () => void
	onToggleReason: (value: string) => void
	opened: boolean
	selectedValues: string[]
}

/* * */

export function FeedbackReasonOptionsSheet({ agencyId, category, entityType, onClose, onToggleReason, opened, selectedValues }: FeedbackReasonOptionsSheetProps) {
	//

	//
	// A. Setup variables

	const reasonGroup = getFeedbackReasonGroups(entityType, agencyId)[category];
	const hasReachedSelectionLimit = selectedValues.length >= 2;

	//
	// B. Render component

	if (!reasonGroup) return null;

	return (
		<BottomSheet
			onClose={onClose}
			opened={opened}
			size="fit"
			title={reasonGroup.heading}
		>
			<div className={styles.sheet}>
				<div className={styles.sheetHeader}>
					<h2 className={styles.sheetTitle}>{reasonGroup.heading}</h2>
					<p className={styles.sheetDescription}>Selecione os motivos que se aplicam.</p>
				</div>

				<div className={styles.reasonOptions}>
					{reasonGroup.options.map((option) => {
						const isSelected = selectedValues.includes(option.value);
						const isDisabled = hasReachedSelectionLimit && !isSelected;

						return (
							<label key={option.value} className={styles.reasonOption} data-disabled={isDisabled} data-selected={isSelected}>
								<input
									checked={isSelected}
									disabled={isDisabled}
									onChange={() => onToggleReason(option.value)}
									type="checkbox"
									value={option.value}
								/>
								<span>{option.label}</span>
							</label>
						);
					})}
				</div>
			</div>
		</BottomSheet>
	);
}
