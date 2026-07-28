'use client';

/* * */

import { MetricCard, type MetricCardSize } from '@/components/MetricCard';
import { MetricNumber } from '@/components/MetricNumber';
import { getPercentage } from '@/utils/videowall-metrics';
import { IconClock } from '@tabler/icons-react';
import { type VideowallServiceValue } from '@tmlmobilidade/go-types-public-info';
import { useTranslation } from 'react-i18next';

/* * */

interface Props {
	agencyLabel: string
	isLoading?: boolean
	isValidating?: boolean
	size: MetricCardSize
	timestamp?: number
	value: null | undefined | VideowallServiceValue
}

/* * */

export function DelayedServicesCard({ agencyLabel, isLoading, isValidating, size, timestamp, value }: Props) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const delayedQuantity = value?.delays.delayed_for_more_than_five_minutes_rides_qty;
	const delayedPercentage = value && delayedQuantity !== undefined
		? getPercentage(delayedQuantity, value.sla.scheduled_rides_until_cutoff_qty)
		: null;

	//
	// F. Render components

	return (
		<MetricCard
			icon={<IconClock />}
			isLoading={isLoading}
			isUnavailable={!value}
			isValidating={isValidating}
			sentiment={delayedPercentage === null ? 'normal' : delayedPercentage > 9.5 ? 'bad' : 'good'}
			size={size}
			timestamp={timestamp}
			title={t('default:videowall.cards.delayed_services', '', { agency: agencyLabel })}
			valuePrimary={<MetricNumber suffix="%" value={delayedPercentage} />}
			valueSecondary={delayedQuantity === undefined ? undefined : <MetricNumber value={delayedQuantity} />}
		/>
	);

	//
}
