'use client';

import { useCalendarDayCounterContext } from '@/components/calendar/day-counter/CalendarDayCounter.context';
import { CalendarDayCounterMonths } from '@/components/calendar/day-counter/CalendarDayCounterMonths';
import { CalendarDayCounterPeriods } from '@/components/calendar/day-counter/CalendarDayCounterPeriods';
import { CalendarDayCounterWeekdays } from '@/components/calendar/day-counter/CalendarDayCounterWeekdays';
import { Divider, Section, Select } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function CalendarDayCounterCriteria() {
	//

	//
	// A. Setup variables

	const dayCounterContext = useCalendarDayCounterContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<aside className={styles.root}>
			<Section gap="lg">
				<Select
					clearable={false}
					data={dayCounterContext.data.agencyOptions}
					disabled={dayCounterContext.flags.is_loading}
					label={t('shared:components.calendar.agency')}
					onChange={dayCounterContext.actions.setAgencyId}
					placeholder={t('default:calendar.dayCounter.selectAgency')}
					value={dayCounterContext.filters.agencyId}
					w="100%"
				/>

				<Divider />
				<CalendarDayCounterPeriods />

				<Divider />
				<CalendarDayCounterWeekdays />

				<Divider />
				<CalendarDayCounterMonths />
			</Section>
		</aside>
	);

	//
}
