'use client';

import type { HubAlert } from '@tmlmobilidade/types';

import { AlertActivePeriodStart } from '@/components/alerts/common/AlertActivePeriod';
import { IconCircleArrowRightFilled } from '@tabler/icons-react';
import Link from 'next/link';

import styles from './styles.module.css';

/* * */

interface Props {
	alert: HubAlert
	target?: '_blank' | '_self'
}

/* * */

export function AlertsCarouselSlide({ alert, target = '_blank' }: Props) {
	//

	//
	// A. Render components

	return (
		<Link className={styles.container} href={`/alerts/${alert._id}`} target={target}>
			<AlertActivePeriodStart date={alert.active_period_start_date} size="sm" />
			<p className={styles.title}>
				{alert.title}
				<IconCircleArrowRightFilled className={styles.icon} size={16} />
			</p>
		</Link>
	);

	//
}
