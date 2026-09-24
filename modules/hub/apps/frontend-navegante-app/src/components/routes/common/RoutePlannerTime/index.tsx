'use client';

import { type RoutePlannerTimeStatus } from '@/utils/route-planner/itinerary/realtime';
import { formatMotisPlanTime } from '@/utils/route-planner/presentation/format';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RoutePlannerTimeProps {
	time: RoutePlannerTimeStatus
}

/* * */

export function RoutePlannerTime({ time }: RoutePlannerTimeProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	const effectiveTime = formatMotisPlanTime(time.effective_time);
	const plannedTimeLabel = formatMotisPlanTime(time.planned_time);
	const hasChangedTime = time.is_realtime && effectiveTime !== plannedTimeLabel;

	//
	// C. Render components

	return (
		<span className={styles.container} data-realtime={time.is_realtime}>
			{hasChangedTime && (
				<del>{plannedTimeLabel}</del>
			)}
			<strong>{effectiveTime}</strong>
			{time.is_realtime && <em>{t('default:routes.RoutePlanner.results.realtime')}</em>}
		</span>
	);

	//
}
