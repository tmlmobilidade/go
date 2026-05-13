'use client';

import type { Alert } from '@tmlmobilidade/go-hub-pckg-types';

import { AlertActivePeriodStart } from '@/components/alerts/AlertActivePeriod';
import { getAlertStartDateOrEpoch, getAlertTitle } from '@/utils/alerts';
import { IconCircleArrowRightFilled } from '@tabler/icons-react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

interface Props {
	alert: Alert
	target?: '_blank' | '_self'
}

/* * */

export function AlertsCarouselSlide({ alert, target = '_blank' }: Props) {
	//

	const locale = useLocale();

	const { startDate, title } = useMemo(() => ({
		startDate: getAlertStartDateOrEpoch(alert),
		title: getAlertTitle(alert, locale),
	}), [alert, locale]);

	//
	// A. Render components

	return (
		<Link className={styles.container} href={`/alerts/${alert.alert_id}`} target={target}>
			<AlertActivePeriodStart date={startDate} size="sm" />
			<p className={styles.title}>
				{title}
				<IconCircleArrowRightFilled className={styles.icon} size={16} />
			</p>
		</Link>
	);

	//
}
