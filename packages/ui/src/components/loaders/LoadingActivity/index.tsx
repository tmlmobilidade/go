'use client';

import { Dates } from '@tmlmobilidade/dates';
import { type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { Indicator, IndicatorProps, Loader } from '@tmlmobilidade/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

interface LoadingActivityProps {
	isLoading: boolean
	isValidating: boolean
	timestamp: null | UnixTimestamp
}

/* * */

export function LoadingActivity({ isLoading, isValidating, timestamp }: LoadingActivityProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [indicatorVariant, setIndicatorVariant] = useState<IndicatorProps['variant']>('muted');
	const [tooltipValue, setTooltipValue] = useState<string>('---');

	//
	// B. Transform data

	useEffect(() => {
		const updateTooltipValue = () => {
			if (!timestamp) return;
			const diff = Dates.now('local').unix_timestamp - timestamp;
			if (diff < 1000) return setTooltipValue(t('shared:components.loaders.LoadingActivity.just_now'));
			if (diff < 60 * 1000) return setTooltipValue(t('shared:components.loaders.LoadingActivity.seconds_ago', '', { count: Math.floor(diff / 1000) }));
			if (diff < 60 * 60 * 1000) return setTooltipValue(t('shared:components.loaders.LoadingActivity.minutes_ago', '', { count: Math.floor(diff / 1000 / 60) }));
			if (diff < 24 * 60 * 60 * 1000) return setTooltipValue(t('shared:components.loaders.LoadingActivity.hours_ago', '', { count: Math.floor(diff / 1000 / 60 / 60) }));
			return setTooltipValue(t('shared:components.loaders.LoadingActivity.days_ago', '', { count: Math.floor(diff / 1000 / 60 / 60 / 24) }));
		};
		updateTooltipValue();
		const interval = setInterval(() => updateTooltipValue(), 1_000);
		return () => clearInterval(interval);
	}, [timestamp, t]);

	useEffect(() => {
		const updateIndicatorVariant = () => {
			if (!timestamp) return;
			const diff = Dates.now('local').unix_timestamp - timestamp;
			if (diff < 10_000) return setIndicatorVariant('primary');
			return setIndicatorVariant('muted');
		};
		updateIndicatorVariant();
		const interval = setInterval(() => updateIndicatorVariant(), 1_000);
		return () => clearInterval(interval);
	}, [timestamp]);

	//
	// C. Render components

	if (isLoading) {
		return <Loader size="sm" />;
	}

	if (isValidating) {
		return (
			<Indicator
				tooltip={tooltipValue}
				variant="warning"
				filled
			/>
		);
	}

	return (
		<Indicator
			tooltip={tooltipValue}
			variant={indicatorVariant}
			filled
		/>
	);
}
