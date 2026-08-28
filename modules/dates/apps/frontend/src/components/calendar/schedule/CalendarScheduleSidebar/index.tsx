'use client';

import { openCalendarDayCounterModal } from '@/components/calendar/day-counter/CalendarDayCounterModal/CalendarDayCounter.modal';
import { IconCalculator } from '@tabler/icons-react';
import { type CalendarDate, toCalendarDate } from '@tmlmobilidade/types';
import { Button, type CalendarScheduleEventType, Checkbox, ColorSwatch, DatePicker, EVENT_TYPE_DEFS, Select } from '@tmlmobilidade/ui';
import { useEffect, useState } from 'react';

import styles from './styles.module.css';

interface CalendarScheduleSidebarProps {
	agencyOptions: { label: string, value: string }[]
	canShowPeriods: boolean
	counts: Record<CalendarScheduleEventType, number>
	date: CalendarDate
	enabledTypes: Record<CalendarScheduleEventType, boolean>
	locale: string
	onAgencyChange: (agencyId: null | string) => void
	onDateChange: (date: string) => void
	onToggle: (type: CalendarScheduleEventType) => void
	selectedAgencyId: null | string
}

const ALL_AGENCIES_VALUE = '__all_agencies__';

const FILTER_TYPES: { label: string, type: CalendarScheduleEventType }[] = [
	{ label: 'Períodos', type: 'period' },
	{ label: 'Feriados', type: 'holiday' },
	{ label: 'Anotações', type: 'annotation' },
	{ label: 'Eventos', type: 'event' },
];

/* * */

export function CalendarScheduleSidebar({ agencyOptions, canShowPeriods, counts, date, enabledTypes, locale, onAgencyChange, onDateChange, onToggle, selectedAgencyId }: CalendarScheduleSidebarProps) {
	//

	//
	// A. Setup variables

	const [displayedMonth, setDisplayedMonth] = useState<CalendarDate>(date);

	const selectOptions = [
		{ label: 'Todos os operadores', value: ALL_AGENCIES_VALUE },
		...agencyOptions,
	];

	useEffect(() => setDisplayedMonth(date), [date]);

	//
	// B. Handle actions

	const handleAgencyChange = (value: null | string) => {
		onAgencyChange(value && value !== ALL_AGENCIES_VALUE ? value : null);
	};

	const handleDateSelect = (value: null | string) => {
		if (!value) return;

		const selectedDate = toCalendarDate(value.slice(0, 10));
		setDisplayedMonth(selectedDate);
		onDateChange(selectedDate);
	};

	const handleDisplayedMonthChange = (value: string) => {
		setDisplayedMonth(toCalendarDate(value.slice(0, 10)));
	};

	//
	// C. Render components

	return (
		<aside className={styles.root}>
			<DatePicker
				allowDeselect={false}
				className={styles.miniCalendar}
				date={displayedMonth}
				firstDayOfWeek={1}
				locale={locale}
				onChange={handleDateSelect}
				onDateChange={handleDisplayedMonthChange}
				value={date}
				weekendDays={[0, 6]}
				ariaLabels={{
					monthLevelControl: 'Selecionar mês',
					nextMonth: 'Mês seguinte',
					previousMonth: 'Mês anterior',
					yearLevelControl: 'Selecionar ano',
				}}
				classNames={{
					calendarHeaderControl: styles.miniCalendarHeaderControl,
					calendarHeaderLevel: styles.miniCalendarHeaderLevel,
					day: styles.miniCalendarDay,
				}}
				highlightToday
			/>

			<Select
				clearable={false}
				data={selectOptions}
				label="Operador"
				onChange={handleAgencyChange}
				value={selectedAgencyId ?? ALL_AGENCIES_VALUE}
			/>

			<section className={styles.section}>
				<h2 className={styles.title}>Filtrar eventos</h2>

				<div className={styles.filters}>
					{FILTER_TYPES.map(({ label, type }) => {
						const isPeriodUnavailable = type === 'period' && !canShowPeriods;

						return (
							<Checkbox
								key={type}
								checked={isPeriodUnavailable ? false : enabledTypes[type]}
								disabled={isPeriodUnavailable}
								onChange={() => onToggle(type)}
								label={(
									<span className={styles.label}>
										<ColorSwatch color={EVENT_TYPE_DEFS[type].color} size={10} />
										<span>{label}</span>
										<span className={styles.count}>({counts[type]})</span>
									</span>
								)}
							/>
						);
					})}
				</div>

				{selectedAgencyId === null && (
					<p className={styles.hint}>Selecione um operador para visualizar os períodos.</p>
				)}
			</section>

			<Button
				className={styles.dayCounterButton}
				icon={<IconCalculator size={18} />}
				label="Contar dias"
				onClick={() => openCalendarDayCounterModal(selectedAgencyId)}
			/>
		</aside>
	);

	//
}
