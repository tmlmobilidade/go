'use client';

import { type FeedbackEntityType, type FeedbackReasonCategory, getFeedbackReasonGroups } from '@/components/feedback/feedback-config';
import { IconBus, IconBusStop, IconRoute, IconSteeringWheel } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface FeedbackReasonCategoriesProps {
	entityType: FeedbackEntityType
	onSelect: (category: FeedbackReasonCategory) => void
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

export function FeedbackReasonCategories({ entityType, onSelect }: FeedbackReasonCategoriesProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const reasonGroups = getFeedbackReasonGroups(entityType, reasonId => t(`default:feedback.reasons.${reasonId}`));

	//
	// B. Render components

	return (
		<div className={styles.container}>
			<p className={styles.description}>Ajude-nos a melhorar o serviço.</p>

			<div className={styles.options}>
				{Object.entries(reasonGroups).map(([category, reasonGroup]) => (
					<button key={category} className={styles.option} onClick={() => onSelect(category as FeedbackReasonCategory)} type="button">
						{getReasonCategoryIcon(category)}
						<span>{reasonGroup.heading}</span>
					</button>
				))}
			</div>
		</div>
	);
}
