'use client';

import { AlertActivePeriodStart } from '@/components/alerts/common/AlertActivePeriod';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { IconCircleArrowRightFilled } from '@tabler/icons-react';
import { type HubAlert } from '@tmlmobilidade/types';

import styles from './styles.module.css';

/* * */

interface AlertsCarouselSlideProps {
	alert: HubAlert
}

export function AlertsCarouselSlide({ alert }: AlertsCarouselSlideProps) {
	//

	//
	// A. Setup variables

	const { setActiveBottomSheet } = useBottomSheet();

	//
	// B. Handle actions

	const handleClick = () => {
		setActiveBottomSheet({ entityId: alert._id, view: 'alerts-detail' });
	};

	//
	// C. Render components

	return (
		<div className={styles.container}>
			<AlertActivePeriodStart date={alert.active_period_start_date} size="sm" />
			<p className={styles.title} onClick={handleClick}>
				{alert.title}
				<IconCircleArrowRightFilled className={styles.icon} size={16} />
			</p>
		</div>
	);
}
