'use client';

/* * */

import { useAreasVkmData } from '@/areas/shared/use-areas-vkm-data';
import { CardDefault } from '@/components/CardDefault';
import { Clock } from '@/components/Clock';
import { Grid } from '@/components/Grid';
import { IconRulerMeasure } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function AreaCmScreen4() {
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

	const vkm41Parsed = useMemo(() => {
		if (!vkmData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: vkmData._41_simple_three_events_or_simple_one_validation_transaction_vkm_until_now,
			primary_value_string: Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(vkmData._41_simple_three_events_or_simple_one_validation_transaction_vkm_until_now / 1000),
			secondary_value: vkmData._41_simple_three_events_or_simple_one_validation_transaction_vkm_until_now / vkmData._41_scheduled_vkm_until_now,
			secondary_value_string: `${parseFloat(((vkmData._41_simple_three_events_or_simple_one_validation_transaction_vkm_until_now * 100) / vkmData._41_scheduled_vkm_until_now).toFixed(2))}%`,
			// secondary_value_string: Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(vkmData._41_scheduled_vkm_until_now / 1000),
		};
	}, [vkmData]);

	const vkm42Parsed = useMemo(() => {
		if (!vkmData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: vkmData._42_simple_three_events_or_simple_one_validation_transaction_vkm_until_now,
			primary_value_string: Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(vkmData._42_simple_three_events_or_simple_one_validation_transaction_vkm_until_now / 1000),
			secondary_value: vkmData._42_simple_three_events_or_simple_one_validation_transaction_vkm_until_now / vkmData._42_scheduled_vkm_until_now,
			secondary_value_string: `${parseFloat(((vkmData._42_simple_three_events_or_simple_one_validation_transaction_vkm_until_now * 100) / vkmData._42_scheduled_vkm_until_now).toFixed(2))}%`,
			// secondary_value_string: Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(vkmData._42_scheduled_vkm_until_now / 1000),
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

	const vkm44Parsed = useMemo(() => {
		if (!vkmData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: vkmData._44_simple_three_events_or_simple_one_validation_transaction_vkm_until_now,
			primary_value_string: Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(vkmData._44_simple_three_events_or_simple_one_validation_transaction_vkm_until_now / 1000),
			secondary_value: vkmData._44_simple_three_events_or_simple_one_validation_transaction_vkm_until_now / vkmData._44_scheduled_vkm_until_now,
			secondary_value_string: `${parseFloat(((vkmData._44_simple_three_events_or_simple_one_validation_transaction_vkm_until_now * 100) / vkmData._44_scheduled_vkm_until_now).toFixed(2))}%`,
			// secondary_value_string: Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(vkmData._44_scheduled_vkm_until_now / 1000),
		};
	}, [vkmData]);

	//
	// D. Render components

	return (
		<Grid
			layout="sixDetails"
			cells={[
				<CardDefault
					key="41-vkm"
					icon={<IconRulerMeasure />}
					isLoading={vkmLoading}
					isValidating={vkmValidating}
					sentiment="normal"
					size="lg"
					timestamp={vkmTimestamp}
					title={t('default:areas.cards.vkm.title', '', { agency: '41' })}
					valuePrimary={vkm41Parsed.primary_value_string}
					valueSecondary={vkm41Parsed.secondary_value_string}
				/>,
				<CardDefault
					key="42-vkm"
					icon={<IconRulerMeasure />}
					isLoading={vkmLoading}
					isValidating={vkmValidating}
					sentiment="normal"
					size="lg"
					timestamp={vkmTimestamp}
					title={t('default:areas.cards.vkm.title', '', { agency: '42' })}
					valuePrimary={vkm42Parsed.primary_value_string}
					valueSecondary={vkm42Parsed.secondary_value_string}
				/>,
				<CardDefault
					key="43-vkm"
					icon={<IconRulerMeasure />}
					isLoading={vkmLoading}
					isValidating={vkmValidating}
					sentiment="normal"
					size="lg"
					timestamp={vkmTimestamp}
					title={t('default:areas.cards.vkm.title', '', { agency: '43' })}
					valuePrimary={vkm43Parsed.primary_value_string}
					valueSecondary={vkm43Parsed.secondary_value_string}
				/>,
				<CardDefault
					key="44-vkm"
					icon={<IconRulerMeasure />}
					isLoading={vkmLoading}
					isValidating={vkmValidating}
					sentiment="normal"
					size="lg"
					timestamp={vkmTimestamp}
					title={t('default:areas.cards.vkm.title', '', { agency: '44' })}
					valuePrimary={vkm44Parsed.primary_value_string}
					valueSecondary={vkm44Parsed.secondary_value_string}
				/>,
				<CardDefault
					key="cm-vkm"
					icon={<IconRulerMeasure />}
					isLoading={vkmLoading}
					isValidating={vkmValidating}
					sentiment="normal"
					size="lg"
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
