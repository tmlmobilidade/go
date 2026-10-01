'use client';

/* * */

import { useAreasSlaData } from '@/areas/shared/use-areas-sla-data';
import { CardDefaultArea } from '@/components/CardDefaultArea';
import { GridArea } from '@/components/GridArea';
import { IconBusOff } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function Area44Screen2() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Fetch data

	const { data: slaData, isLoading: slaLoading, isValidating: slaValidating, timestamp_resource: slaTimestamp } = useAreasSlaData();

	//
	// C. Transform data

	const slaCmParsed = useMemo(() => {
		if (!slaData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: slaData._cm_simple_three_events_or_simple_one_validation_transaction_fail_until_now,
			primary_value_string: Intl.NumberFormat('pt-PT').format(slaData._cm_simple_three_events_or_simple_one_validation_transaction_fail_until_now),
			secondary_value: slaData._cm_simple_three_events_or_simple_one_validation_transaction_fail_until_now / slaData._cm_scheduled_rides_until_now,
			secondary_value_string: t('default:areas.cards.sla.secondary', '', {
				percentage: String(parseFloat(((slaData._cm_simple_three_events_or_simple_one_validation_transaction_fail_until_now * 100) / slaData._cm_scheduled_rides_until_now).toFixed(2))),
				total: String(slaData._cm_scheduled_rides_total),
				until_now: String(slaData._cm_scheduled_rides_until_now),
			}),
		};
	}, [slaData, t]);
	const sla44Parsed = useMemo(() => {
		if (!slaData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: slaData._44_simple_three_events_or_simple_one_validation_transaction_fail_until_now,
			primary_value_string: Intl.NumberFormat('pt-PT').format(slaData._44_simple_three_events_or_simple_one_validation_transaction_fail_until_now),
			secondary_value: slaData._44_simple_three_events_or_simple_one_validation_transaction_fail_until_now / slaData._44_scheduled_rides_until_now,
			secondary_value_string: t('default:areas.cards.sla.secondary', '', {
				percentage: String(parseFloat(((slaData._44_simple_three_events_or_simple_one_validation_transaction_fail_until_now * 100) / slaData._44_scheduled_rides_until_now).toFixed(2))),
				total: String(slaData._44_scheduled_rides_total),
				until_now: String(slaData._44_scheduled_rides_until_now),
			}),
		};
	}, [slaData, t]);

	//
	// D. Render components

	return (
		<GridArea
			layout="primaryWithFourDetails"
			cells={[
				<CardDefaultArea
					key="44-sla"
					icon={<IconBusOff size={45} />}
					isLoading={slaLoading}
					isValidating={slaValidating}
					sentiment={sla44Parsed.secondary_value > 0.05 ? 'bad' : 'good'}
					size="lg"
					timestamp={slaTimestamp}
					title={t('default:areas.cards.sla.title', '', { agency: '44' })}
					valuePrimary={sla44Parsed.primary_value_string}
					valueSecondary={sla44Parsed.secondary_value_string}
				/>,
				<CardDefaultArea
					key="cm-sla"
					icon={<IconBusOff size={45} />}
					isLoading={slaLoading}
					isValidating={slaValidating}
					sentiment={slaCmParsed.secondary_value > 0.05 ? 'bad' : 'good'}
					size="lg"
					timestamp={slaTimestamp}
					title={t('default:areas.cards.sla.title', '', { agency: 'CM' })}
					valuePrimary={slaCmParsed.primary_value_string}
					valueSecondary={slaCmParsed.secondary_value_string}
				/>,
			]}
		/>
	);

	//
}
