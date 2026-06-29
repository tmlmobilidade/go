'use client';

/* * */

import { CardDefaultArea } from '@/components/CardDefaultArea';
import { GridArea } from '@/components/GridArea';
import { IconBusOff } from '@tabler/icons-react';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

export function Screen2() {
	//

	//
	// A. Fetch data

	const { data: slaData, isLoading: slaLoading, isValidating: slaValidating } = useSWR('https://api.carrismetropolitana.pt/v2/metrics/videowall/sla');

	//
	// B. Transform data

	const slaCmParsed = useMemo(() => {
		if (!slaData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: slaData.data._cm_simple_three_events_or_simple_one_validation_transaction_fail_until_now,
			primary_value_string: Intl.NumberFormat('pt-PT').format(slaData.data._cm_simple_three_events_or_simple_one_validation_transaction_fail_until_now),
			secondary_value: slaData.data._cm_simple_three_events_or_simple_one_validation_transaction_fail_until_now / slaData.data._cm_scheduled_rides_until_now,
			secondary_value_string: `${parseFloat(((slaData.data._cm_simple_three_events_or_simple_one_validation_transaction_fail_until_now * 100) / slaData.data._cm_scheduled_rides_until_now).toFixed(2))}% de ${slaData.data._cm_scheduled_rides_until_now} (${slaData.data._cm_scheduled_rides_total})`,
		};
	}, [slaData]);

	const sla41Parsed = useMemo(() => {
		if (!slaData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: slaData.data._41_simple_three_events_or_simple_one_validation_transaction_fail_until_now,
			primary_value_string: Intl.NumberFormat('pt-PT').format(slaData.data._41_simple_three_events_or_simple_one_validation_transaction_fail_until_now),
			secondary_value: slaData.data._41_simple_three_events_or_simple_one_validation_transaction_fail_until_now / slaData.data._41_scheduled_rides_until_now,
			secondary_value_string: `${parseFloat(((slaData.data._41_simple_three_events_or_simple_one_validation_transaction_fail_until_now * 100) / slaData.data._41_scheduled_rides_until_now).toFixed(2))}% de ${slaData.data._41_scheduled_rides_until_now} (${slaData.data._41_scheduled_rides_total})`,
		};
	}, [slaData]);
	//
	// C. Render components

	return (
		<GridArea
			layout="primaryWithFourDetails"
			cells={[
				<CardDefaultArea
					icon={<IconBusOff size={45} />}
					isLoading={slaLoading}
					isValidating={slaValidating}
					sentiment={sla41Parsed.secondary_value > 0.05 ? 'bad' : 'good'}
					size="lg"
					timestamp={slaData?.timestamp_resource}
					title="41 / Viagens não executadas hoje, até agora"
					valuePrimary={sla41Parsed.primary_value_string}
					valueSecondary={sla41Parsed.secondary_value_string}
				/>,
				<CardDefaultArea
					icon={<IconBusOff size={45} />}
					isLoading={slaLoading}
					isValidating={slaValidating}
					sentiment={slaCmParsed.secondary_value > 0.05 ? 'bad' : 'good'}
					size="lg"
					timestamp={slaData?.timestamp_resource}
					title="CM / Viagens não executadas hoje, até agora"
					valuePrimary={slaCmParsed.primary_value_string}
					valueSecondary={slaCmParsed.secondary_value_string}
				/>,
			]}
		/>
	);

	//
}
