'use client';

/* * */

import { CardDefault } from '@/components/CardDefault';
import { Grid } from '@/components/Grid';
import { IconClock } from '@tabler/icons-react';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

export function Screen3() {
	//

	//
	// A. Fetch data

	const { data: slaData, isLoading: slaLoading, isValidating: slaValidating } = useSWR('https://api.carrismetropolitana.pt/v2/metrics/videowall/sla');
	const { data: delaysData, isLoading: delaysLoading, isValidating: delaysValidating } = useSWR('https://api.carrismetropolitana.pt/v2/metrics/videowall/delays');

	//
	// B. Transform data

	const delaysCmOverview = useMemo(() => {
		if (!delaysData || !slaData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '-' };
		const formattedSeconds = delaysData.data._cm_average_delay_minutes * 60 % 60;
		const formattedMinutes = delaysData.data._cm_average_delay_minutes - formattedSeconds / 60;
		return {
			primary_value: delaysData.data._cm_average_delay_minutes,
			primary_value_string: `${Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(formattedMinutes)}m ${Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(formattedSeconds)}s`,
			secondary_value: delaysData.data._cm_average_delay_minutes,
			secondary_value_string: `${Intl.NumberFormat('pt-PT').format(slaData.data._cm_scheduled_rides_until_now)}`,
		};
	}, [delaysData, slaData]);

	const delaysCmParsed = useMemo(() => {
		if (!delaysData || !slaData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '-' };
		return {
			primary_value: delaysData.data._cm_delayed_for_more_than_five_minutes_count / slaData.data._cm_scheduled_rides_until_now,
			primary_value_string: `${Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(delaysData.data._cm_delayed_for_more_than_five_minutes_count / slaData.data._cm_scheduled_rides_until_now * 100)}%`,
			secondary_value: delaysData.data._cm_delayed_for_more_than_five_minutes_count,
			secondary_value_string: `${Intl.NumberFormat('pt-PT').format(delaysData.data._cm_delayed_for_more_than_five_minutes_count)}`,
		};
	}, [delaysData, slaData]);

	const delays41Parsed = useMemo(() => {
		if (!delaysData || !slaData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '-' };
		return {
			primary_value: delaysData.data._41_delayed_for_more_than_five_minutes_count / slaData.data._41_scheduled_rides_until_now,
			primary_value_string: `${Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(delaysData.data._41_delayed_for_more_than_five_minutes_count / slaData.data._41_scheduled_rides_until_now * 100)}%`,
			secondary_value: delaysData.data._41_delayed_for_more_than_five_minutes_count,
			secondary_value_string: `${Intl.NumberFormat('pt-PT').format(delaysData.data._41_delayed_for_more_than_five_minutes_count)}`,
		};
	}, [delaysData, slaData]);

	const delays42Parsed = useMemo(() => {
		if (!delaysData || !slaData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '-' };
		return {
			primary_value: delaysData.data._42_delayed_for_more_than_five_minutes_count / slaData.data._42_scheduled_rides_until_now,
			primary_value_string: `${Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(delaysData.data._42_delayed_for_more_than_five_minutes_count / slaData.data._42_scheduled_rides_until_now * 100)}%`,
			secondary_value: delaysData.data._42_delayed_for_more_than_five_minutes_count,
			secondary_value_string: `${Intl.NumberFormat('pt-PT').format(delaysData.data._42_delayed_for_more_than_five_minutes_count)}`,
		};
	}, [delaysData, slaData]);

	const delays43Parsed = useMemo(() => {
		if (!delaysData || !slaData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '-' };
		return {
			primary_value: delaysData.data._43_delayed_for_more_than_five_minutes_count / slaData.data._43_scheduled_rides_until_now,
			primary_value_string: `${Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(delaysData.data._43_delayed_for_more_than_five_minutes_count / slaData.data._43_scheduled_rides_until_now * 100)}%`,
			secondary_value: delaysData.data._43_delayed_for_more_than_five_minutes_count,
			secondary_value_string: `${Intl.NumberFormat('pt-PT').format(delaysData.data._43_delayed_for_more_than_five_minutes_count)}`,
		};
	}, [delaysData, slaData]);

	const delays44Parsed = useMemo(() => {
		if (!delaysData || !slaData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '-' };
		return {
			primary_value: delaysData.data._44_delayed_for_more_than_five_minutes_count / slaData.data._44_scheduled_rides_until_now,
			primary_value_string: `${Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(delaysData.data._44_delayed_for_more_than_five_minutes_count / slaData.data._44_scheduled_rides_until_now * 100)}%`,
			secondary_value: delaysData.data._44_delayed_for_more_than_five_minutes_count,
			secondary_value_string: `${Intl.NumberFormat('pt-PT').format(delaysData.data._44_delayed_for_more_than_five_minutes_count)}`,
		};
	}, [delaysData, slaData]);

	//
	// C. Render components

	return (
		<Grid
			layout="sixDetails"
			cells={[
				<CardDefault
					icon={<IconClock />}
					isLoading={delaysLoading || slaLoading}
					isValidating={delaysValidating || slaValidating}
					sentiment={delaysCmOverview.primary_value > 3 ? 'bad' : 'good'}
					timestamp={delaysData?.timestamp_resource}
					title="CM / Atraso médio do total de viagens"
					valuePrimary={delaysCmOverview.primary_value_string}
					valueSecondary={delaysCmOverview.secondary_value_string}
				/>,
				<CardDefault
					icon={<IconClock />}
					isLoading={delaysLoading || slaLoading}
					isValidating={delaysValidating || slaValidating}
					sentiment={delaysCmParsed.primary_value > 0.095 ? 'bad' : 'good'}
					timestamp={delaysData?.timestamp_resource}
					title="CM / Viagens atrasadas > 5 min"
					valuePrimary={delaysCmParsed.primary_value_string}
					valueSecondary={delaysCmParsed.secondary_value_string}
				/>,
				<CardDefault
					icon={<IconClock />}
					isLoading={delaysLoading || slaLoading}
					isValidating={delaysValidating || slaValidating}
					sentiment={delays41Parsed.primary_value > 0.095 ? 'bad' : 'good'}
					timestamp={delaysData?.timestamp_resource}
					title="41 / Viagens atrasadas > 5 min"
					valuePrimary={delays41Parsed.primary_value_string}
					valueSecondary={delays41Parsed.secondary_value_string}
				/>,
				<CardDefault
					icon={<IconClock />}
					isLoading={delaysLoading || slaLoading}
					isValidating={delaysValidating || slaValidating}
					sentiment={delays42Parsed.primary_value > 0.095 ? 'bad' : 'good'}
					timestamp={delaysData?.timestamp_resource}
					title="42 / Viagens atrasadas > 5 min"
					valuePrimary={delays42Parsed.primary_value_string}
					valueSecondary={delays42Parsed.secondary_value_string}
				/>,
				<CardDefault
					icon={<IconClock />}
					isLoading={delaysLoading || slaLoading}
					isValidating={delaysValidating || slaValidating}
					sentiment={delays43Parsed.primary_value > 0.095 ? 'bad' : 'good'}
					timestamp={delaysData?.timestamp_resource}
					title="43 / Viagens atrasadas > 5 min"
					valuePrimary={delays43Parsed.primary_value_string}
					valueSecondary={delays43Parsed.secondary_value_string}
				/>,
				<CardDefault
					icon={<IconClock />}
					isLoading={delaysLoading || slaLoading}
					isValidating={delaysValidating || slaValidating}
					sentiment={delays44Parsed.primary_value > 0.095 ? 'bad' : 'good'}
					timestamp={delaysData?.timestamp_resource}
					title="44 / Viagens atrasadas > 5 min"
					valuePrimary={delays44Parsed.primary_value_string}
					valueSecondary={delays44Parsed.secondary_value_string}
				/>,
			]}
		/>
	);

	//
}
