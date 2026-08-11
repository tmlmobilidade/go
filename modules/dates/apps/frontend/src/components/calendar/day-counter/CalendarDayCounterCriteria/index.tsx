'use client';

import { useCalendarDayCounterContext } from '@/components/calendar/day-counter/CalendarDayCounter.context';
import { CalendarDayCounterMonths } from '@/components/calendar/day-counter/CalendarDayCounterMonths';
import { CalendarDayCounterPeriods } from '@/components/calendar/day-counter/CalendarDayCounterPeriods';
import { CalendarDayCounterWeekdays } from '@/components/calendar/day-counter/CalendarDayCounterWeekdays';
import { Divider, Section, Select } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function CalendarDayCounterCriteria() {
	//

	//
	// A. Setup variables

	const dayCounterContext = useCalendarDayCounterContext();

	//
	// B. Render components

	return (
		<aside className={styles.root}>
			<Section gap="lg">
				<Select
					clearable={false}
					data={dayCounterContext.data.agencyOptions}
					disabled={dayCounterContext.flags.is_loading}
					label="Operador"
					onChange={dayCounterContext.actions.setAgencyId}
					placeholder="Selecione um operador"
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
