'use client';

import { useCalendarDayCounterContext } from '@/components/calendar/day-counter/CalendarDayCounter.context';
import { getMonthOptions } from '@tmlmobilidade/go-utils-dates';
import { Section, SegmentedMultiSelect, Text, useLocaleContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function CalendarDayCounterMonths() {
	//

	//
	// A. Setup variables

	const dayCounterContext = useCalendarDayCounterContext();
	const { t } = useTranslation();
	const { data: { locale } } = useLocaleContext();

	//
	// B. Transform data

	const monthOptions = useMemo(() => getMonthOptions(locale), [locale]);

	//
	// C. Render components

	return (
		<Section gap="md" padding="none">
			<Text>{t('default:calendar.dayCounter.months')}</Text>

			<SegmentedMultiSelect
				className={styles.selector}
				onChange={dayCounterContext.actions.setMonths}
				options={monthOptions}
				size="sm"
				value={dayCounterContext.filters.months}
			/>
		</Section>
	);

	//
}
