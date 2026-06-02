'use client';

import type { HubAlert } from '@tmlmobilidade/types';

import { AlertActivePeriodStart } from '@/components/alerts/common/AlertActivePeriod';
import { AlertDetailModal } from '@/components/lines/common/AlertDetailModal';
import { IconCircleArrowRightFilled } from '@tabler/icons-react';
import { useState } from 'react';

import styles from './styles.module.css';

/* * */

interface Props {
	alert: HubAlert
}

/* * */

export function AlertsCarouselSlide({ alert }: Props) {
	//

	//
	// A. Setup variables

	const [isOpen, setIsOpen] = useState<boolean>(false);

	//
	// B. Render components

	return (
		<div className={styles.container}>
			<AlertActivePeriodStart date={alert.active_period_start_date} size="sm" />
			<p className={styles.title} onClick={() => setIsOpen(true)}>
				{alert.title}
				<IconCircleArrowRightFilled className={styles.icon} size={16} />
			</p>
			<AlertDetailModal alert={alert} isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</div>
	);

	//
}
