'use client';

import { RoutePlannerTime } from '@/components/routes/common/RoutePlannerTime';
import { RoutePlannerItineraryDetailStep } from '@/components/routes/detail/RoutePlannerItineraryDetailStep';
import { type RoutePlannerWaitingStep } from '@/utils/route-planner/itinerary/waiting';
import { IconClock } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Props {
	step: RoutePlannerWaitingStep
}

/* * */

export function RoutePlannerItineraryWaitStep({ step }: Props) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const minutes = Math.max(1, Math.round(step.duration_seconds / 60));

	//
	// B. Render components

	return (
		<RoutePlannerItineraryDetailStep marker={<span aria-hidden="true" className={styles.badge}><IconClock size={18} /></span>}>
			<strong className={styles.title}>{t('default:routes.RoutePlanner.results.waiting_step', '', { count: minutes })}</strong>
			<div className={styles.times}>
				<RoutePlannerTime time={step.from_time} />
				<span aria-hidden="true">→</span>
				<RoutePlannerTime time={step.to_time} />
			</div>
		</RoutePlannerItineraryDetailStep>
	);
}
