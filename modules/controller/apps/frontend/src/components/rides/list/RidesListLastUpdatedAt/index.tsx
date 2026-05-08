'use client';

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { Indicator, IndicatorProps, Loader } from '@tmlmobilidade/ui';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function RidesListLastUpdatedAt() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const ridesListContext = useRidesListContext();

	const [indicatorVariant, setIndicatorVariant] = useState<IndicatorProps['variant']>('muted');
	const [tooltipValue, setTooltipValue] = useState<string>('---');

	//
	// B. Transform data

	useEffect(() => {
		const updateTooltipValue = () => {
			const diff = DateTime.now().toMillis() - (ridesListContext.flags.last_updated_at ?? 0);
			if (diff < 1000) return setTooltipValue(t('default:list.RidesListLastUpdatedAt.just_now'));
			if (diff < 60 * 1000) return setTooltipValue(`${Math.floor(diff / 1000)} seg`);
			if (diff < 60 * 60 * 1000) return setTooltipValue(`${Math.floor(diff / 1000 / 60)} min`);
			if (diff < 24 * 60 * 60 * 1000) return setTooltipValue(`${Math.floor(diff / 1000 / 60 / 60)} h`);
			return setTooltipValue(`${Math.floor(diff / 1000 / 60 / 60 / 24)} d`);
		};
		updateTooltipValue();
		const interval = setInterval(() => updateTooltipValue(), 1_000);
		return () => clearInterval(interval);
	}, [ridesListContext.flags.last_updated_at]);

	useEffect(() => {
		const updateIndicatorVariant = () => {
			const diff = DateTime.now().toMillis() - (ridesListContext.flags.last_updated_at ?? 0);
			if (diff < 10_000) return setIndicatorVariant('primary');
			return setIndicatorVariant('muted');
		};
		updateIndicatorVariant();
		const interval = setInterval(() => updateIndicatorVariant(), 1_000);
		return () => clearInterval(interval);
	}, [ridesListContext.flags.last_updated_at]);

	//
	// C. Render components

	if (ridesListContext.flags.loading) {
		return <Loader size="sm" />;
	}

	return (
		<Indicator
			tooltip={tooltipValue}
			variant={indicatorVariant}
			filled
		/>
	);

	//
}
