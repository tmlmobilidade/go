'use client';

/* * */

import { CardDefault } from '@/components/CardDefault';
import { Grid } from '@/components/Grid';
import { IconCreditCardPay } from '@tabler/icons-react';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

export function Screen1() {
	//

	//
	// A. Fetch data

	const { data: validationsData, isLoading: validationsLoading, isValidating: validationsValidating } = useSWR({ credentials: 'omit', url: 'https://api.carrismetropolitana.pt/v2/metrics/videowall/validations' });

	console.log(validationsData);

	//
	// B. Transform data

	const validationsCmParsed = useMemo(() => {
		if (!validationsData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: validationsData._cm_today_valid_count,
			primary_value_string: Intl.NumberFormat('pt-PT').format(validationsData._cm_today_valid_count),
			secondary_value: validationsData._cm_today_valid_count / validationsData._cm_last_week_valid_count,
			secondary_value_string: `${parseFloat(((validationsData._cm_today_valid_count * 100) / validationsData._cm_last_week_valid_count).toFixed(2))}%`,
		};
	}, [validationsData]);

	const validations41Parsed = useMemo(() => {
		if (!validationsData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: validationsData._41_today_valid_count,
			primary_value_string: Intl.NumberFormat('pt-PT').format(validationsData._41_today_valid_count),
			secondary_value: validationsData._41_today_valid_count / validationsData._41_last_week_valid_count,
			secondary_value_string: `${parseFloat(((validationsData._41_today_valid_count * 100) / validationsData._41_last_week_valid_count).toFixed(2))}%`,
		};
	}, [validationsData]);

	const validations42Parsed = useMemo(() => {
		if (!validationsData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: validationsData._42_today_valid_count,
			primary_value_string: Intl.NumberFormat('pt-PT').format(validationsData._42_today_valid_count),
			secondary_value: validationsData._42_today_valid_count / validationsData._42_last_week_valid_count,
			secondary_value_string: `${parseFloat(((validationsData._42_today_valid_count * 100) / validationsData._42_last_week_valid_count).toFixed(2))}%`,
		};
	}, [validationsData]);

	const validations43Parsed = useMemo(() => {
		if (!validationsData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: validationsData._43_today_valid_count,
			primary_value_string: Intl.NumberFormat('pt-PT').format(validationsData._43_today_valid_count),
			secondary_value: validationsData._43_today_valid_count / validationsData._43_last_week_valid_count,
			secondary_value_string: `${parseFloat(((validationsData._43_today_valid_count * 100) / validationsData._43_last_week_valid_count).toFixed(2))}%`,
		};
	}, [validationsData]);

	const validations44Parsed = useMemo(() => {
		if (!validationsData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: validationsData._44_today_valid_count,
			primary_value_string: Intl.NumberFormat('pt-PT').format(validationsData._44_today_valid_count),
			secondary_value: validationsData._44_today_valid_count / validationsData._44_last_week_valid_count,
			secondary_value_string: `${parseFloat(((validationsData._44_today_valid_count * 100) / validationsData._44_last_week_valid_count).toFixed(2))}%`,
		};
	}, [validationsData]);

	//
	// C. Render components

	return (
		<Grid
			layout="primaryWithFourDetails"
			cells={[
				<CardDefault
					key="cm-passengers-today"
					icon={<IconCreditCardPay />}
					isLoading={validationsLoading}
					isValidating={validationsValidating}
					sentiment={validationsCmParsed.secondary_value < 1 ? 'normal' : 'good'}
					timestamp={validationsData?.timestamp_resource}
					title="CM / Passageiros transportados hoje, até agora"
					valuePrimary={validationsCmParsed.primary_value_string}
					valueSecondary={validationsCmParsed.secondary_value_string}
				/>,
				<CardDefault
					key="41-passengers-today"
					icon={<IconCreditCardPay />}
					isLoading={validationsLoading}
					isValidating={validationsValidating}
					sentiment={validations41Parsed.secondary_value < 1 ? 'normal' : 'good'}
					timestamp={validationsData?.timestamp_resource}
					title="41 / Passageiros transportados hoje, até agora"
					valuePrimary={validations41Parsed.primary_value_string}
					valueSecondary={validations41Parsed.secondary_value_string}
				/>,
				<CardDefault
					key="42-passengers-today"
					icon={<IconCreditCardPay />}
					isLoading={validationsLoading}
					isValidating={validationsValidating}
					sentiment={validations42Parsed.secondary_value < 1 ? 'normal' : 'good'}
					timestamp={validationsData?.timestamp_resource}
					title="42 / Passageiros transportados hoje, até agora"
					valuePrimary={validations42Parsed.primary_value_string}
					valueSecondary={validations42Parsed.secondary_value_string}
				/>,
				<CardDefault
					key="43-passengers-today"
					icon={<IconCreditCardPay />}
					isLoading={validationsLoading}
					isValidating={validationsValidating}
					sentiment={validations43Parsed.secondary_value < 1 ? 'normal' : 'good'}
					timestamp={validationsData?.timestamp_resource}
					title="43 / Passageiros transportados hoje, até agora"
					valuePrimary={validations43Parsed.primary_value_string}
					valueSecondary={validations43Parsed.secondary_value_string}
				/>,
				<CardDefault
					key="44-passengers-today"
					icon={<IconCreditCardPay />}
					isLoading={validationsLoading}
					isValidating={validationsValidating}
					sentiment={validations44Parsed.secondary_value < 1 ? 'normal' : 'good'}
					timestamp={validationsData?.timestamp_resource}
					title="44 / Passageiros transportados hoje, até agora"
					valuePrimary={validations44Parsed.primary_value_string}
					valueSecondary={validations44Parsed.secondary_value_string}
				/>,
			]}
		/>
	);

	//
}
