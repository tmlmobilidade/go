'use client';

/* * */

import { useAreasDelaysData } from '@/areas/shared/use-areas-delays-data';
import { useAreasSlaData } from '@/areas/shared/use-areas-sla-data';
import { CardDefaultArea } from '@/components/CardDefaultArea';
import { GridArea } from '@/components/GridArea';
import { IconClock } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function Area41Screen3() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Fetch data

	const { data: slaData, isLoading: slaLoading, isValidating: slaValidating } = useAreasSlaData();
	const { data: delaysData, isLoading: delaysLoading, isValidating: delaysValidating, timestamp_resource: delaysTimestamp } = useAreasDelaysData();

	//
	// C. Transform data

	const delaysCmOverview = useMemo(() => {
		if (!delaysData || !slaData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '-' };
		const formattedSeconds = delaysData._cm_average_delay_minutes * 60 % 60;
		const formattedMinutes = delaysData._cm_average_delay_minutes - formattedSeconds / 60;
		return {
			primary_value: delaysData._cm_average_delay_minutes,
			primary_value_string: `${Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(formattedMinutes)}m ${Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(formattedSeconds)}s`,
			secondary_value: delaysData._cm_average_delay_minutes,
			secondary_value_string: `${Intl.NumberFormat('pt-PT').format(slaData._cm_scheduled_rides_until_now)}`,
		};
	}, [delaysData, slaData]);

	const delaysCmParsed = useMemo(() => {
		if (!delaysData || !slaData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '-' };
		return {
			primary_value: delaysData._cm_delayed_for_more_than_five_minutes_count / slaData._cm_scheduled_rides_until_now,
			primary_value_string: `${Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(delaysData._cm_delayed_for_more_than_five_minutes_count / slaData._cm_scheduled_rides_until_now * 100)}%`,
			secondary_value: delaysData._cm_delayed_for_more_than_five_minutes_count,
			secondary_value_string: `${Intl.NumberFormat('pt-PT').format(delaysData._cm_delayed_for_more_than_five_minutes_count)}`,
		};
	}, [delaysData, slaData]);

	const delays41Parsed = useMemo(() => {
		if (!delaysData || !slaData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '-' };
		return {
			primary_value: delaysData._41_delayed_for_more_than_five_minutes_count / slaData._41_scheduled_rides_until_now,
			primary_value_string: `${Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(delaysData._41_delayed_for_more_than_five_minutes_count / slaData._41_scheduled_rides_until_now * 100)}%`,
			secondary_value: delaysData._41_delayed_for_more_than_five_minutes_count,
			secondary_value_string: `${Intl.NumberFormat('pt-PT').format(delaysData._41_delayed_for_more_than_five_minutes_count)}`,
		};
	}, [delaysData, slaData]);

	//
	// D. Render components

	return (
		<GridArea
			layout="sixDetails"
			cells={[
				<CardDefaultArea
					key="41-delays"
					icon={<IconClock size={45} />}
					isLoading={delaysLoading || slaLoading}
					isValidating={delaysValidating || slaValidating}
					sentiment={delays41Parsed.primary_value > 0.095 ? 'bad' : 'good'}
					size="lg"
					timestamp={delaysTimestamp}
					title={t('default:areas.cards.delays.title', '', { agency: '41' })}
					valuePrimary={delays41Parsed.primary_value_string}
					valueSecondary={delays41Parsed.secondary_value_string}
				/>,
				<CardDefaultArea
					key="cm-delays_average"
					icon={<IconClock size={45} />}
					isLoading={delaysLoading || slaLoading}
					isValidating={delaysValidating || slaValidating}
					sentiment={delaysCmOverview.primary_value > 3 ? 'bad' : 'good'}
					size="lg"
					timestamp={delaysTimestamp}
					title={t('default:areas.cards.delays_average.title', '', { agency: 'CM' })}
					valuePrimary={delaysCmOverview.primary_value_string}
					valueSecondary={delaysCmOverview.secondary_value_string}
				/>,
				<CardDefaultArea
					key="cm-delays"
					icon={<IconClock size={45} />}
					isLoading={delaysLoading || slaLoading}
					isValidating={delaysValidating || slaValidating}
					sentiment={delaysCmParsed.primary_value > 0.095 ? 'bad' : 'good'}
					size="lg"
					timestamp={delaysTimestamp}
					title={t('default:areas.cards.delays.title', '', { agency: 'CM' })}
					valuePrimary={delaysCmParsed.primary_value_string}
					valueSecondary={delaysCmParsed.secondary_value_string}
				/>,
			]}
		/>
	);

	//
}
