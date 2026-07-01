'use client';

/* * */

import { CardDefault } from '@/components/CardDefault';
import { Clock } from '@/components/Clock';
import { Grid } from '@/components/Grid';
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

	const vkm42Parsed = useMemo(() => {
		if (!vkmData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: vkmData.data._42_simple_three_events_or_simple_one_validation_transaction_vkm_until_now,
			primary_value_string: Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(vkmData.data._42_simple_three_events_or_simple_one_validation_transaction_vkm_until_now / 1000),
			secondary_value: vkmData.data._42_simple_three_events_or_simple_one_validation_transaction_vkm_until_now / vkmData.data._42_scheduled_vkm_until_now,
			secondary_value_string: `${parseFloat(((vkmData.data._42_simple_three_events_or_simple_one_validation_transaction_vkm_until_now * 100) / vkmData.data._42_scheduled_vkm_until_now).toFixed(2))}%`,
			// secondary_value_string: Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(vkmData.data._42_scheduled_vkm_until_now / 1000),
		};
	}, [vkmData]);

	const vkm43Parsed = useMemo(() => {
		if (!vkmData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: vkmData.data._43_simple_three_events_or_simple_one_validation_transaction_vkm_until_now,
			primary_value_string: Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(vkmData.data._43_simple_three_events_or_simple_one_validation_transaction_vkm_until_now / 1000),
			secondary_value: vkmData.data._43_simple_three_events_or_simple_one_validation_transaction_vkm_until_now / vkmData.data._43_scheduled_vkm_until_now,
			secondary_value_string: `${parseFloat(((vkmData.data._43_simple_three_events_or_simple_one_validation_transaction_vkm_until_now * 100) / vkmData.data._43_scheduled_vkm_until_now).toFixed(2))}%`,
			// secondary_value_string: Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(vkmData.data._43_scheduled_vkm_until_now / 1000),
		};
	}, [vkmData]);

	const vkm44Parsed = useMemo(() => {
		if (!vkmData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: vkmData.data._44_simple_three_events_or_simple_one_validation_transaction_vkm_until_now,
			primary_value_string: Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(vkmData.data._44_simple_three_events_or_simple_one_validation_transaction_vkm_until_now / 1000),
			secondary_value: vkmData.data._44_simple_three_events_or_simple_one_validation_transaction_vkm_until_now / vkmData.data._44_scheduled_vkm_until_now,
			secondary_value_string: `${parseFloat(((vkmData.data._44_simple_three_events_or_simple_one_validation_transaction_vkm_until_now * 100) / vkmData.data._44_scheduled_vkm_until_now).toFixed(2))}%`,
			// secondary_value_string: Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(vkmData.data._44_scheduled_vkm_until_now / 1000),
		};
	}, [vkmData]);

	//
	// C. Render components

	return (
		<Grid
			layout="sixDetails"
			cells={[
				<CardDefault
					icon={<IconRulerMeasure />}
					isLoading={vkmLoading}
					isValidating={vkmValidating}
					sentiment="normal"
					size="lg"
					timestamp={vkmData?.timestamp_resource}
					title="41 / VKm Executados hoje, até agora"
					valuePrimary={vkm41Parsed.primary_value_string}
					valueSecondary={vkm41Parsed.secondary_value_string}
				/>,
				<CardDefault
					icon={<IconRulerMeasure />}
					isLoading={vkmLoading}
					isValidating={vkmValidating}
					sentiment="normal"
					size="lg"
					timestamp={vkmData?.timestamp_resource}
					title="42 / VKm Executados hoje, até agora"
					valuePrimary={vkm42Parsed.primary_value_string}
					valueSecondary={vkm42Parsed.secondary_value_string}
				/>,
				<CardDefault
					icon={<IconRulerMeasure />}
					isLoading={vkmLoading}
					isValidating={vkmValidating}
					sentiment="normal"
					size="lg"
					timestamp={vkmData?.timestamp_resource}
					title="43 / VKm Executados hoje, até agora"
					valuePrimary={vkm43Parsed.primary_value_string}
					valueSecondary={vkm43Parsed.secondary_value_string}
				/>,
				<CardDefault
					icon={<IconRulerMeasure />}
					isLoading={vkmLoading}
					isValidating={vkmValidating}
					sentiment="normal"
					size="lg"
					timestamp={vkmData?.timestamp_resource}
					title="44 / VKm Executados hoje, até agora"
					valuePrimary={vkm44Parsed.primary_value_string}
					valueSecondary={vkm44Parsed.secondary_value_string}
				/>,
				<CardDefault
					icon={<IconRulerMeasure />}
					isLoading={vkmLoading}
					isValidating={vkmValidating}
					sentiment="normal"
					size="lg"
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
