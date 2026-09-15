'use client';

/* * */

import { useAreasValidationsData } from '@/areas/shared/use-areas-validations-data';
import { CardDefaultArea } from '@/components/CardDefaultArea';
import { GridArea } from '@/components/GridArea';
import { IconCreditCardPay } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function Area42Screen1() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Fetch data

	const { data: validationsData, isLoading: validationsLoading, isValidating: validationsValidating, timestamp_resource: validationsTimestamp } = useAreasValidationsData();

	//
	// C. Transform data

	const validationsCmParsed = useMemo(() => {
		if (!validationsData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: validationsData._cm_today_valid_count,
			primary_value_string: Intl.NumberFormat('pt-PT').format(validationsData._cm_today_valid_count),
			secondary_value: validationsData._cm_today_valid_count / validationsData._cm_last_week_valid_count,
			secondary_value_string: `${parseFloat(((validationsData._cm_today_valid_count * 100) / validationsData._cm_last_week_valid_count).toFixed(2))}%`,
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

	//
	// D. Render components

	return (
		<GridArea
			layout="primaryWithFourDetails"
			cells={[
				<CardDefaultArea
					key="42-validations"
					icon={<IconCreditCardPay size={45} />}
					isLoading={validationsLoading}
					isValidating={validationsValidating}
					sentiment={validations42Parsed.secondary_value < 1 ? 'normal' : 'good'}
					timestamp={validationsTimestamp}
					title={t('default:areas.cards.validations.title', '', { agency: '42' })}
					valuePrimary={validations42Parsed.primary_value_string}
					valueSecondary={validations42Parsed.secondary_value_string}
				/>,
				<CardDefaultArea
					key="cm-validations"
					icon={<IconCreditCardPay size={45} />}
					isLoading={validationsLoading}
					isValidating={validationsValidating}
					sentiment={validationsCmParsed.secondary_value < 1 ? 'normal' : 'good'}
					timestamp={validationsTimestamp}
					title={t('default:areas.cards.validations.title', '', { agency: 'CM' })}
					valuePrimary={validationsCmParsed.primary_value_string}
					valueSecondary={validationsCmParsed.secondary_value_string}
				/>,

			]}
		/>
	);

	//
}
