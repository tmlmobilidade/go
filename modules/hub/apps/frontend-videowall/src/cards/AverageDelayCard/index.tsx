'use client';

/* * */

import { MetricCard, type MetricCardSize } from '@/components/MetricCard';
import { MetricDuration } from '@/components/MetricDuration';
import { MetricNumber } from '@/components/MetricNumber';
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

export function AverageDelayCard({ agencyLabel, isLoading, isValidating, size, timestamp, value }: Props) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const averageDelay = value?.delays.average_start_delay_minutes ?? null;

	//
	// F. Render components

	return (
		<MetricCard
			icon={<IconClock />}
			isLoading={isLoading}
			isUnavailable={!value || averageDelay === null}
			isValidating={isValidating}
			sentiment={averageDelay === null ? 'normal' : averageDelay > 3 ? 'bad' : 'good'}
			size={size}
			timestamp={timestamp}
			title={t('default:videowall.cards.average_delay', '', { agency: agencyLabel })}
			valuePrimary={<MetricDuration value={averageDelay} />}
			valueSecondary={value ? <MetricNumber value={value.sla.scheduled_rides_until_cutoff_qty} /> : undefined}
		/>
	);

	//
}
