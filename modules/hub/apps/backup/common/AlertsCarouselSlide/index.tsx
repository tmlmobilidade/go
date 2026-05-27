'use client';

import type { SimplifiedAlert } from '@tmlmobilidade/go-hub-pckg-types';

import { AlertActivePeriodStart } from '@/components/alerts/AlertActivePeriod';
import { IconCircleArrowRightFilled } from '@tabler/icons-react';
import Link from 'next/link';

import styles from './styles.module.css';

/* * */

interface Props {
	alert: SimplifiedAlert
	target?: '_blank' | '_self'
}

/* * */

export function AlertsCarouselSlide({ alert, target = '_blank' }: Props) {
	//

	//
	// A. Render components

	return (
		<Link className={styles.container} href={`/alerts/${alert.alert_id}`} target={target}>
			<AlertActivePeriodStart date={alert.start_date} size="sm" />
			<p className={styles.title}>
				{alert.title}
				<IconCircleArrowRightFilled className={styles.icon} size={16} />
			</p>
		</Link>
	);

	//
}
