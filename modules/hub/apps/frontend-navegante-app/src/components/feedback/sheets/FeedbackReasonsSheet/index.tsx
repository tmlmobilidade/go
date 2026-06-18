'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { type FeedbackEntityType, type FeedbackReasonCategory, getFeedbackReasonGroups } from '@/components/feedback/feedback-config';
import { IconBus, IconBusStop, IconRoute, IconSteeringWheel } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

interface FeedbackReasonsSheetProps {
	agencyId?: string
	description: string
	entityType: FeedbackEntityType
	heading: string
	onClose: () => void
	onSelectCategory: (category: FeedbackReasonCategory) => void
	opened: boolean
}

/* * */

function getReasonCategoryIcon(category: string) {
	if (category === 'line_service') return <IconRoute aria-hidden={true} size={22} stroke={2} />;
	if (category === 'vehicle') return <IconBus aria-hidden={true} size={22} stroke={2} />;
	if (category === 'driver') return <IconSteeringWheel aria-hidden={true} size={22} stroke={2} />;
	if (category === 'stop') return <IconBusStop aria-hidden={true} size={22} stroke={2} />;
	return null;
}

/* * */

export function FeedbackReasonsSheet({ agencyId, description, entityType, heading, onClose, onSelectCategory, opened }: FeedbackReasonsSheetProps) {
	//

	//
	// A. Setup variables

	const reasonGroups = getFeedbackReasonGroups(entityType, agencyId);

	//
	// B. Render component

	return (
		<BottomSheet
			onClose={onClose}
			opened={opened}
			size="fit"
			title="Feedback"
		>
			<div className={styles.sheet}>
				<div className={styles.sheetHeader}>
					<h2 className={styles.sheetTitle}>{heading}</h2>
					<p className={styles.sheetDescription}>{description}</p>
				</div>

				<div className={styles.sheetOptions}>
					{Object.entries(reasonGroups).map(([category, reasonGroup]) => (
						<button key={category} className={styles.sheetOption} onClick={() => onSelectCategory(category as FeedbackReasonCategory)} type="button">
							{getReasonCategoryIcon(category)}
							<span>{reasonGroup.heading}</span>
						</button>
					))}
				</div>
			</div>
		</BottomSheet>
	);
}
