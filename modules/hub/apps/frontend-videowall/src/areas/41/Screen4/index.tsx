'use client';

/* * */

import { CardDefaultArea } from '@/components/CardDefaultArea';
import { Clock } from '@/components/Clock';
import { GridArea } from '@/components/GridArea';
import { IconRulerMeasure } from '@tabler/icons-react';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

export function Screen4() {
	//

	//
	// A. Fetch data

	const { data: vkmData, isLoading: vkmLoading, isValidating: vkmValidating } = useSWR('https://api.carrismetropolitana.pt/v2/metrics/videowall/vkm');

	//
	// B. Transform data

	const vkmCmParsed = useMemo(() => {
		if (!vkmData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: vkmData.data._cm_simple_three_events_or_simple_one_validation_transaction_vkm_until_now,
			primary_value_string: Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(vkmData.data._cm_simple_three_events_or_simple_one_validation_transaction_vkm_until_now / 1000),
			secondary_value: vkmData.data._cm_simple_three_events_or_simple_one_validation_transaction_vkm_until_now / vkmData.data._cm_scheduled_vkm_until_now,
			secondary_value_string: `${parseFloat(((vkmData.data._cm_simple_three_events_or_simple_one_validation_transaction_vkm_until_now * 100) / vkmData.data._cm_scheduled_vkm_until_now).toFixed(2))}%`,
			// secondary_value_string: Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(vkmData.data._cm_scheduled_vkm_until_now / 1000),
		};
	}, [vkmData]);

	const vkm41Parsed = useMemo(() => {
		if (!vkmData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: vkmData.data._41_simple_three_events_or_simple_one_validation_transaction_vkm_until_now,
			primary_value_string: Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(vkmData.data._41_simple_three_events_or_simple_one_validation_transaction_vkm_until_now / 1000),
			secondary_value: vkmData.data._41_simple_three_events_or_simple_one_validation_transaction_vkm_until_now / vkmData.data._41_scheduled_vkm_until_now,
			secondary_value_string: `${parseFloat(((vkmData.data._41_simple_three_events_or_simple_one_validation_transaction_vkm_until_now * 100) / vkmData.data._41_scheduled_vkm_until_now).toFixed(2))}%`,
			// secondary_value_string: Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(vkmData.data._41_scheduled_vkm_until_now / 1000),
		};
	}, [vkmData]);
	//
	// C. Render components

	return (
		<GridArea
			layout="sixDetails"
			cells={[
				<CardDefaultArea
					icon={<IconRulerMeasure size={45} />}
					isLoading={vkmLoading}
					isValidating={vkmValidating}
					sentiment="normal"
					size="lg"
					timestamp={vkmData?.timestamp_resource}
					title="41 / VKm Executados hoje, até agora"
					valuePrimary={vkm41Parsed.primary_value_string}
					valueSecondary={vkm41Parsed.secondary_value_string}
				/>,
				<CardDefaultArea
					icon={<IconRulerMeasure size={45} />}
					isLoading={vkmLoading}
					isValidating={vkmValidating}
					sentiment="normal"
					size="md"
					timestamp={vkmData?.timestamp_resource}
					title="CM / VKm Executados hoje, até agora"
					valuePrimary={vkmCmParsed.primary_value_string}
					valueSecondary={vkmCmParsed.secondary_value_string}
				/>,
				<Clock />,
			]}
		/>
	);

	//
}
