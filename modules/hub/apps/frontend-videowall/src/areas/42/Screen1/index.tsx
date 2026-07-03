'use client';

/* * */

import { CardDefaultArea } from '@/components/CardDefaultArea';
import { GridArea } from '@/components/GridArea';
import { IconCreditCardPay } from '@tabler/icons-react';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

export function Screen1() {
	//

	//
	// A. Fetch data

	const { data: validationsData, isLoading: validationsLoading, isValidating: validationsValidating } = useSWR('https://api.carrismetropolitana.pt/v2/metrics/videowall/validations');
	// B. Transform data

	const validationsCmParsed = useMemo(() => {
		if (!validationsData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: validationsData.data._cm_today_valid_count,
			primary_value_string: Intl.NumberFormat('pt-PT').format(validationsData.data._cm_today_valid_count),
			secondary_value: validationsData.data._cm_today_valid_count / validationsData.data._cm_last_week_valid_count,
			secondary_value_string: `${parseFloat(((validationsData.data._cm_today_valid_count * 100) / validationsData.data._cm_last_week_valid_count).toFixed(2))}%`,
		};
	}, [validationsData]);

	const validations42Parsed = useMemo(() => {
		if (!validationsData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: validationsData.data._42_today_valid_count,
			primary_value_string: Intl.NumberFormat('pt-PT').format(validationsData.data._42_today_valid_count),
			secondary_value: validationsData.data._42_today_valid_count / validationsData.data._42_last_week_valid_count,
			secondary_value_string: `${parseFloat(((validationsData.data._42_today_valid_count * 100) / validationsData.data._42_last_week_valid_count).toFixed(2))}%`,
		};
	}, [validationsData]);

	//
	// C. Render components

	return (
		<GridArea
			layout="primaryWithFourDetails"
			cells={[
				<CardDefaultArea
					icon={<IconCreditCardPay size={45} />}
					isLoading={validationsLoading}
					isValidating={validationsValidating}
					sentiment={validations42Parsed.secondary_value < 1 ? 'normal' : 'good'}
					timestamp={validationsData?.timestamp_resource}
					title="42 / Passageiros transportados hoje, até agora"
					valuePrimary={validations42Parsed.primary_value_string}
					valueSecondary={validations42Parsed.secondary_value_string}
				/>,
				<CardDefaultArea
					icon={<IconCreditCardPay size={45} />}
					isLoading={validationsLoading}
					isValidating={validationsValidating}
					sentiment={validationsCmParsed.secondary_value < 1 ? 'normal' : 'good'}
					timestamp={validationsData?.timestamp_resource}
					title="CM / Passageiros transportados hoje, até agora"
					valuePrimary={validationsCmParsed.primary_value_string}
					valueSecondary={validationsCmParsed.secondary_value_string}
				/>,

			]}
		/>
	);
	//
}
