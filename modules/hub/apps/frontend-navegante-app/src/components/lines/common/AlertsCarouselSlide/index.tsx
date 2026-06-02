'use client';

import type { HubAlert } from '@tmlmobilidade/types';

import { AlertActivePeriodStart } from '@/components/alerts/common/AlertActivePeriod';
import { IconCircleArrowRightFilled } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

interface Props {
	alert: HubAlert
}

/* * */

export function AlertsCarouselSlide({ alert }: Props) {
	//

	//
	// A. Render components

	return (
		<div className={styles.container}>
			<AlertActivePeriodStart date={alert.active_period_start_date} size="sm" />
			<p className={styles.title}>
				{alert.title}
				<IconCircleArrowRightFilled className={styles.icon} size={16} />
			</p>
		</div>
	);

	//
}
