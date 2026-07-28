'use client';

/* * */

import { MetricCard, type MetricCardSize } from '@/components/MetricCard';
import { MetricNumber } from '@/components/MetricNumber';
import { getPercentage } from '@/utils/videowall-metrics';
import { IconBusOff } from '@tabler/icons-react';
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

export function ServiceFailuresCard({ agencyLabel, isLoading, isValidating, size, timestamp, value }: Props) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const failureQuantity = value?.sla.simple_three_vehicle_events_or_apex_validation_fail_rides_qty;
	const failurePercentage = value && failureQuantity !== undefined
		? getPercentage(failureQuantity, value.sla.scheduled_rides_until_cutoff_qty)
		: null;
	const valueSecondary = value
		? (
			<>
				<MetricNumber decimalScale={2} suffix="% " value={failurePercentage} />
				<MetricNumber
					prefix={`${t('default:videowall.cards.service_failures_of')} `}
					value={value.sla.scheduled_rides_until_cutoff_qty}
				/>
				<MetricNumber
					prefix=" ("
					suffix=")"
					value={value.sla.scheduled_rides_total_qty}
				/>
			</>
		)
		: undefined;

	//
	// F. Render components

	return (
		<MetricCard
			icon={<IconBusOff />}
			isLoading={isLoading}
			isUnavailable={!value}
			isValidating={isValidating}
			sentiment={failurePercentage === null ? 'normal' : failurePercentage > 5 ? 'bad' : 'good'}
			size={size}
			timestamp={timestamp}
			title={t('default:videowall.cards.service_failures', '', { agency: agencyLabel })}
			valuePrimary={<MetricNumber value={failureQuantity} />}
			valueSecondary={valueSecondary}
		/>
	);

	//
}
