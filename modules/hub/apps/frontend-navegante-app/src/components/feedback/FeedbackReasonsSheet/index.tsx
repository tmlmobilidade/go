'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { type FeedbackReasonCategory } from '@/components/feedback/feedback-reason-options';
import { IconBus, IconHeadset, IconRoute } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

interface FeedbackReasonsSheetProps {
	description: string
	heading: string
	onClose: () => void
	onSelectCategory: (category: FeedbackReasonCategory) => void
	opened: boolean
}

/* * */

export function FeedbackReasonsSheet({ description, heading, onClose, onSelectCategory, opened }: FeedbackReasonsSheetProps) {
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
					<button className={styles.sheetOption} onClick={() => onSelectCategory('line_service')} type="button">
						<IconRoute aria-hidden={true} size={22} stroke={2} />
						<span>Linha/serviço</span>
					</button>

					<button className={styles.sheetOption} onClick={() => onSelectCategory('vehicle')} type="button">
						<IconBus aria-hidden={true} size={22} stroke={2} />
						<span>Veículo</span>
					</button>

					<button className={styles.sheetOption} onClick={() => onSelectCategory('support')} type="button">
						<IconHeadset aria-hidden={true} size={22} stroke={2} />
						<span>Atendimento</span>
					</button>
				</div>
			</div>
		</BottomSheet>
	);
}
