'use client';

import { useCalendarDayCounterContext } from '@/components/calendar/day-counter/CalendarDayCounter.context';
import { MONTH_OPTIONS } from '@tmlmobilidade/types';
import { Section, SegmentedMultiSelect, Text } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function CalendarDayCounterMonths() {
	//

	//
	// A. Setup variables

	const dayCounterContext = useCalendarDayCounterContext();

	//
	// B. Render components

	return (
		<Section gap="md" padding="none">
			<Text>Meses</Text>

			<SegmentedMultiSelect
				className={styles.selector}
				onChange={dayCounterContext.actions.setMonths}
				options={[...MONTH_OPTIONS]}
				size="sm"
				value={dayCounterContext.filters.months}
			/>
		</Section>
	);

	//
}
