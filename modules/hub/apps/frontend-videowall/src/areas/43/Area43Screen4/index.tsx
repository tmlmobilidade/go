'use client';

/* * */

import { useAreasVkmData } from '@/areas/shared/use-areas-vkm-data';
import { CardDefaultArea } from '@/components/CardDefaultArea';
import { Clock } from '@/components/Clock';
import { GridArea } from '@/components/GridArea';
import { IconRulerMeasure } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function Area43Screen4() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Fetch data

	const { data: vkmData, isLoading: vkmLoading, isValidating: vkmValidating, timestamp_resource: vkmTimestamp } = useAreasVkmData();

	//
	// C. Transform data

	const vkmCmParsed = useMemo(() => {
		if (!vkmData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: vkmData._cm_simple_three_events_or_simple_one_validation_transaction_vkm_until_now,
			primary_value_string: Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(vkmData._cm_simple_three_events_or_simple_one_validation_transaction_vkm_until_now / 1000),
			secondary_value: vkmData._cm_simple_three_events_or_simple_one_validation_transaction_vkm_until_now / vkmData._cm_scheduled_vkm_until_now,
			secondary_value_string: `${parseFloat(((vkmData._cm_simple_three_events_or_simple_one_validation_transaction_vkm_until_now * 100) / vkmData._cm_scheduled_vkm_until_now).toFixed(2))}%`,
			// secondary_value_string: Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(vkmData._cm_scheduled_vkm_until_now / 1000),
		};
	}, [vkmData]);
	const vkm43Parsed = useMemo(() => {
		if (!vkmData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: vkmData._43_simple_three_events_or_simple_one_validation_transaction_vkm_until_now,
			primary_value_string: Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(vkmData._43_simple_three_events_or_simple_one_validation_transaction_vkm_until_now / 1000),
			secondary_value: vkmData._43_simple_three_events_or_simple_one_validation_transaction_vkm_until_now / vkmData._43_scheduled_vkm_until_now,
			secondary_value_string: `${parseFloat(((vkmData._43_simple_three_events_or_simple_one_validation_transaction_vkm_until_now * 100) / vkmData._43_scheduled_vkm_until_now).toFixed(2))}%`,
			// secondary_value_string: Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(vkmData._43_scheduled_vkm_until_now / 1000),
		};
	}, [vkmData]);

	//
	// D. Render components

	return (
		<GridArea
			layout="sixDetails"
			cells={[
				<CardDefaultArea
					key="43-vkm"
					icon={<IconRulerMeasure size={45} />}
					isLoading={vkmLoading}
					isValidating={vkmValidating}
					sentiment="normal"
					size="lg"
					timestamp={vkmTimestamp}
					title={t('default:areas.cards.vkm.title', '', { agency: '43' })}
					valuePrimary={vkm43Parsed.primary_value_string}
					valueSecondary={vkm43Parsed.secondary_value_string}
				/>,
				<CardDefaultArea
					key="cm-vkm"
					icon={<IconRulerMeasure size={45} />}
					isLoading={vkmLoading}
					isValidating={vkmValidating}
					sentiment="normal"
					size="md"
					timestamp={vkmTimestamp}
					title={t('default:areas.cards.vkm.title', '', { agency: 'CM' })}
					valuePrimary={vkmCmParsed.primary_value_string}
					valueSecondary={vkmCmParsed.secondary_value_string}
				/>,
				<Clock key="clock" />,
			]}
		/>
	);

	//
}
