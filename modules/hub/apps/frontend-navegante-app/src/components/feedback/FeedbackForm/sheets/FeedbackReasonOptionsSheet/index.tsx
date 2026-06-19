'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { FEEDBACK_REASON_SELECTION_LIMIT, type FeedbackEntityType, type FeedbackReasonCategory, getFeedbackReasonGroups } from '@/components/feedback/feedback-config';
import { IconArrowRight } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface FeedbackReasonOptionsSheetProps {
	agencyId?: string
	category: FeedbackReasonCategory
	entityType: FeedbackEntityType
	onClose: () => void
	onContinue: (values: string[]) => void
	opened: boolean
	selectedValues: string[]
}

/* * */

export function FeedbackReasonOptionsSheet({ agencyId, category, entityType, onClose, onContinue, opened, selectedValues }: FeedbackReasonOptionsSheetProps) {
	//

	//
	// A. Setup variables

	const [draftSelectedValues, setDraftSelectedValues] = useState<string[]>(selectedValues);

	const reasonGroup = getFeedbackReasonGroups(entityType, agencyId)[category];
	const hasReachedSelectionLimit = draftSelectedValues.length >= FEEDBACK_REASON_SELECTION_LIMIT;

	//
	// B. Handle actions

	const handleCancel = () => {
		setDraftSelectedValues(selectedValues);
		onClose();
	};

	const handleContinue = () => {
		onContinue([...draftSelectedValues]);
	};

	const handleToggleReason = (reasonValue: string) => {
		setDraftSelectedValues((currentValue) => {
			if (currentValue.includes(reasonValue)) return currentValue.filter(value => value !== reasonValue);
			if (currentValue.length >= FEEDBACK_REASON_SELECTION_LIMIT) return currentValue;

			return [...currentValue, reasonValue];
		});
	};

	//
	// C. Setup effects

	useEffect(() => {
		if (opened) return;

		setDraftSelectedValues(selectedValues);
	}, [opened, selectedValues]);

	//
	// D. Render component

	if (!reasonGroup) return null;

	return (
		<BottomSheet
			onClose={handleCancel}
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
						const isSelected = draftSelectedValues.includes(option.value);
						const isDisabled = hasReachedSelectionLimit && !isSelected;

						return (
							<label key={option.value} className={styles.reasonOption} data-disabled={isDisabled} data-selected={isSelected}>
								<input
									checked={isSelected}
									disabled={isDisabled}
									onChange={() => handleToggleReason(option.value)}
									type="checkbox"
									value={option.value}
								/>
								<span>{option.label}</span>
							</label>
						);
					})}
				</div>

				<div className={styles.sheetActions}>
					<button className={styles.continueButton} onClick={handleContinue} type="button">
						<span>Continuar</span>
						<IconArrowRight aria-hidden={true} size={18} stroke={2.2} />
					</button>
				</div>
			</div>
		</BottomSheet>
	);
}
