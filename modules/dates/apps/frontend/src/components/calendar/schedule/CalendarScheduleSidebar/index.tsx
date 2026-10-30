'use client';

import { openCalendarDayCounterModal } from '@/components/calendar/day-counter/CalendarDayCounterModal/CalendarDayCounter.modal';
import { IconCalculator } from '@tabler/icons-react';
import { type CalendarDate, toCalendarDate } from '@tmlmobilidade/go-types-shared';
import { Button, type CalendarScheduleEventType, Checkbox, ColorSwatch, DatePicker, EVENT_TYPE_DEFS, Select, Tooltip } from '@tmlmobilidade/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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

const FILTER_TYPES: CalendarScheduleEventType[] = ['period', 'holiday', 'annotation', 'event'];

/* * */

export function CalendarScheduleSidebar({ agencyOptions, canShowPeriods, counts, date, enabledTypes, locale, onAgencyChange, onDateChange, onToggle, selectedAgencyId }: CalendarScheduleSidebarProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const [displayedMonth, setDisplayedMonth] = useState<CalendarDate>(date);

	const selectOptions = [
		{ label: t('default:calendar.schedule.allAgencies'), value: ALL_AGENCIES_VALUE },
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
					monthLevelControl: t('shared:components.calendar.selectMonth'),
					nextDecade: t('shared:components.calendar.nextDecade'),
					nextMonth: t('shared:components.calendar.nextMonth'),
					nextYear: t('shared:components.calendar.nextYear'),
					previousDecade: t('shared:components.calendar.previousDecade'),
					previousMonth: t('shared:components.calendar.previousMonth'),
					previousYear: t('shared:components.calendar.previousYear'),
					yearLevelControl: t('shared:components.calendar.selectYear'),
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
				label={t('shared:components.calendar.agency')}
				onChange={handleAgencyChange}
				value={selectedAgencyId ?? ALL_AGENCIES_VALUE}
			/>

			<section className={styles.section}>
				<h2 className={styles.title}>{t('default:calendar.schedule.filtersTitle')}</h2>

				<div className={styles.filters}>
					{FILTER_TYPES.map((type) => {
						const isPeriodUnavailable = type === 'period' && !canShowPeriods;

						return (
							<Tooltip
								key={type}
								disabled={!isPeriodUnavailable || selectedAgencyId !== null}
								events={{ focus: true, hover: true, touch: true }}
								label={t('default:calendar.schedule.periods.selectAgency')}
								withArrow
							>
								<span tabIndex={isPeriodUnavailable && selectedAgencyId === null ? 0 : undefined}>
									<Checkbox
										checked={isPeriodUnavailable ? false : enabledTypes[type]}
										disabled={isPeriodUnavailable}
										onChange={() => onToggle(type)}
										label={(
											<span className={styles.label}>
												<ColorSwatch color={EVENT_TYPE_DEFS[type].color} size={10} />
												<span>{t(`shared:components.calendar.types.${type}`)}</span>
												<span className={styles.count}>({counts[type]})</span>
											</span>
										)}
									/>
								</span>
							</Tooltip>
						);
					})}
				</div>
			</section>

			<Button
				className={styles.dayCounterButton}
				icon={<IconCalculator size={18} />}
				label={t('default:calendar.schedule.countDays')}
				onClick={() => openCalendarDayCounterModal(selectedAgencyId)}
			/>
		</aside>
	);

	//
}
