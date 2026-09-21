'use client';

/* * */

import { useAreasSlaData } from '@/areas/shared/use-areas-sla-data';
import { CardDefault } from '@/components/CardDefault';
import { Grid } from '@/components/Grid';
import { IconBusOff } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function AreaCmScreen2() {
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

	const sla41Parsed = useMemo(() => {
		if (!slaData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: slaData._41_simple_three_events_or_simple_one_validation_transaction_fail_until_now,
			primary_value_string: Intl.NumberFormat('pt-PT').format(slaData._41_simple_three_events_or_simple_one_validation_transaction_fail_until_now),
			secondary_value: slaData._41_simple_three_events_or_simple_one_validation_transaction_fail_until_now / slaData._41_scheduled_rides_until_now,
			secondary_value_string: t('default:areas.cards.sla.secondary', '', {
				percentage: String(parseFloat(((slaData._41_simple_three_events_or_simple_one_validation_transaction_fail_until_now * 100) / slaData._41_scheduled_rides_until_now).toFixed(2))),
				total: String(slaData._41_scheduled_rides_total),
				until_now: String(slaData._41_scheduled_rides_until_now),
			}),
		};
	}, [slaData, t]);

	const sla42Parsed = useMemo(() => {
		if (!slaData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: slaData._42_simple_three_events_or_simple_one_validation_transaction_fail_until_now,
			primary_value_string: Intl.NumberFormat('pt-PT').format(slaData._42_simple_three_events_or_simple_one_validation_transaction_fail_until_now),
			secondary_value: slaData._42_simple_three_events_or_simple_one_validation_transaction_fail_until_now / slaData._42_scheduled_rides_until_now,
			secondary_value_string: t('default:areas.cards.sla.secondary', '', {
				percentage: String(parseFloat(((slaData._42_simple_three_events_or_simple_one_validation_transaction_fail_until_now * 100) / slaData._42_scheduled_rides_until_now).toFixed(2))),
				total: String(slaData._42_scheduled_rides_total),
				until_now: String(slaData._42_scheduled_rides_until_now),
			}),
		};
	}, [slaData, t]);

	const sla43Parsed = useMemo(() => {
		if (!slaData) return { primary_value: 0, secondary_value: 0, secondary_value_string: '?%' };
		return {
			primary_value: slaData._43_simple_three_events_or_simple_one_validation_transaction_fail_until_now,
			primary_value_string: Intl.NumberFormat('pt-PT').format(slaData._43_simple_three_events_or_simple_one_validation_transaction_fail_until_now),
			secondary_value: slaData._43_simple_three_events_or_simple_one_validation_transaction_fail_until_now / slaData._43_scheduled_rides_until_now,
			secondary_value_string: t('default:areas.cards.sla.secondary', '', {
				percentage: String(parseFloat(((slaData._43_simple_three_events_or_simple_one_validation_transaction_fail_until_now * 100) / slaData._43_scheduled_rides_until_now).toFixed(2))),
				total: String(slaData._43_scheduled_rides_total),
				until_now: String(slaData._43_scheduled_rides_until_now),
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
		<Grid
			layout="primaryWithFourDetails"
			cells={[
				<CardDefault
					key="cm-sla"
					icon={<IconBusOff />}
					isLoading={slaLoading}
					isValidating={slaValidating}
					sentiment={slaCmParsed.secondary_value > 0.05 ? 'bad' : 'good'}
					timestamp={slaTimestamp}
					title={t('default:areas.cards.sla.title', '', { agency: 'CM' })}
					valuePrimary={slaCmParsed.primary_value_string}
					valueSecondary={slaCmParsed.secondary_value_string}
				/>,
				<CardDefault
					key="41-sla"
					icon={<IconBusOff />}
					isLoading={slaLoading}
					isValidating={slaValidating}
					sentiment={sla41Parsed.secondary_value > 0.05 ? 'bad' : 'good'}
					timestamp={slaTimestamp}
					title={t('default:areas.cards.sla.title', '', { agency: '41' })}
					valuePrimary={sla41Parsed.primary_value_string}
					valueSecondary={sla41Parsed.secondary_value_string}
				/>,
				<CardDefault
					key="42-sla"
					icon={<IconBusOff />}
					isLoading={slaLoading}
					isValidating={slaValidating}
					sentiment={sla42Parsed.secondary_value > 0.05 ? 'bad' : 'good'}
					timestamp={slaTimestamp}
					title={t('default:areas.cards.sla.title', '', { agency: '42' })}
					valuePrimary={sla42Parsed.primary_value_string}
					valueSecondary={sla42Parsed.secondary_value_string}
				/>,
				<CardDefault
					key="43-sla"
					icon={<IconBusOff />}
					isLoading={slaLoading}
					isValidating={slaValidating}
					sentiment={sla43Parsed.secondary_value > 0.05 ? 'bad' : 'good'}
					timestamp={slaTimestamp}
					title={t('default:areas.cards.sla.title', '', { agency: '43' })}
					valuePrimary={sla43Parsed.primary_value_string}
					valueSecondary={sla43Parsed.secondary_value_string}
				/>,
				<CardDefault
					key="44-sla"
					icon={<IconBusOff />}
					isLoading={slaLoading}
					isValidating={slaValidating}
					sentiment={sla44Parsed.secondary_value > 0.05 ? 'bad' : 'good'}
					timestamp={slaTimestamp}
					title={t('default:areas.cards.sla.title', '', { agency: '44' })}
					valuePrimary={sla44Parsed.primary_value_string}
					valueSecondary={sla44Parsed.secondary_value_string}
				/>,
			]}
		/>
	);

	//
}
