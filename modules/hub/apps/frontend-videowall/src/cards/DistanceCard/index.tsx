'use client';

/* * */

import { MetricCard, type MetricCardSize } from '@/components/MetricCard';
import { MetricNumber } from '@/components/MetricNumber';
import { getPercentage } from '@/utils/videowall-metrics';
import { IconRulerMeasure } from '@tabler/icons-react';
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

export function DistanceCard({ agencyLabel, isLoading, isValidating, size, timestamp, value }: Props) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const executedDistance = value?.vkm.simple_three_vehicle_events_or_apex_validation_distance_km;
	const executedPercentage = value && executedDistance !== undefined
		? getPercentage(executedDistance, value.vkm.scheduled_distance_km)
		: null;

	//
	// F. Render components

	return (
		<MetricCard
			icon={<IconRulerMeasure />}
			isLoading={isLoading}
			isUnavailable={!value}
			isValidating={isValidating}
			sentiment="normal"
			size={size}
			timestamp={timestamp}
			title={t('default:videowall.cards.distance', '', { agency: agencyLabel })}
			valuePrimary={<MetricNumber value={executedDistance} />}
			valueSecondary={<MetricNumber decimalScale={2} suffix="%" value={executedPercentage} />}
		/>
	);

	//
}
