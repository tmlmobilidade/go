'use client';

/* * */

import { MetricCard, type MetricCardSize } from '@/components/cards/MetricCard';
import { MetricSparkline } from '@/components/cards/MetricSparkline';
import { MetricNumber } from '@/components/common/MetricNumber';
import { IconCreditCardPay } from '@tabler/icons-react';
import { type PassengerDemandTrendPoint } from '@tmlmobilidade/go-types-public-info';
import { useTranslation } from 'react-i18next';

/* * */

interface Props {
	agencyLabel: string
	isLoading?: boolean
	isValidating?: boolean
	size: MetricCardSize
	timestamp?: number
	trend?: PassengerDemandTrendPoint[]
	value: null | undefined | {
		comparison_index_pct: null | number
		passenger_validations_qty_now: number
	}
}

/* * */

export function DemandCard({ agencyLabel, isLoading, isValidating, size, timestamp, trend, value }: Props) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const comparisonIndex = value?.comparison_index_pct ?? null;

	//
	// F. Render components

	return (
		<MetricCard
			footerContent={trend && <MetricSparkline points={trend} />}
			icon={<IconCreditCardPay />}
			isLoading={isLoading}
			isUnavailable={!value}
			isValidating={isValidating}
			sentiment={comparisonIndex !== null && comparisonIndex >= 100 ? 'good' : 'normal'}
			size={size}
			timestamp={timestamp}
			title={t('default:videowall.cards.demand', '', { agency: agencyLabel })}
			valuePrimary={<MetricNumber value={value?.passenger_validations_qty_now} />}
			valueSecondary={<MetricNumber decimalScale={2} suffix="%" value={comparisonIndex} />}
		/>
	);

	//
}
