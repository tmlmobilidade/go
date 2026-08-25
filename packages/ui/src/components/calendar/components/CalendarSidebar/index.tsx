'use client';

import { Dates } from '@tmlmobilidade/dates';
import React, { useEffect, useMemo, useState } from 'react';

import styles from './styles.module.css';

import { Checkbox } from '../../../inputs';
import { useCalendarUIContext } from '../../contexts/CalendarUI.context';
import { MiniCalendar } from '../MiniCalendar';

/* * */

export interface CalendarSidebarProps {
	eventTypes: {
		checked: boolean
		color?: string
		count?: number
		id: string
		label: string
	}[]
}

/* * */

export function CalendarSidebar({ eventTypes }: CalendarSidebarProps) {
	//

	const context = useCalendarUIContext();

	const handleToggle = (id: string) => {
		context.actions.toggleEventType(id);
	};

	// Keep mini calendar month local (so user can browse without affecting main calendar)
	const [miniDisplayedMonth, setMiniDisplayedMonth] = useState<Date>(
		new Date(context.state.year, context.state.month - 1),
	);

	// When main calendar changes month/year elsewhere, sync mini calendar view
	useEffect(() => {
		setMiniDisplayedMonth(new Date(context.state.year, context.state.month - 1));
	}, [context.state.month, context.state.year]);

	const handleDayClick = (date: Date) => {
		const datesObj = Dates.fromJSDate(date);

		context.actions.setMonth(
			Number.parseInt(datesObj.toFormat('MM')),
			Number.parseInt(datesObj.toFormat('yyyy')),
		);
	};

	const isDateSelected = useMemo(() => {
		const today = new Date();

		return (date: Date) =>
			date.getFullYear() === today.getFullYear()
			&& date.getMonth() === today.getMonth()
			&& date.getDate() === today.getDate();
	}, []);

	return (
		<div className={styles.sidebar}>
			<MiniCalendar
				displayedMonth={miniDisplayedMonth}
				isDateSelected={isDateSelected}
				onDayClick={handleDayClick}
				onDisplayedMonthChange={setMiniDisplayedMonth}
			/>

			<div className={styles.section}>
				<div className={styles.sectionTitle}>Filtrar Eventos</div>

				<div className={styles.eventTypes}>
					{eventTypes.map((eventType) => {
						const hasCount = eventType.count !== undefined;

						return (
							<div key={eventType.id} className={styles.eventType}>
								<Checkbox
									checked={eventType.checked}
									onChange={() => handleToggle(eventType.id)}
									label={(
										<div className={styles.eventTypeLabel}>
											{eventType.color && (
												<div
													className={styles.eventTypeColor}
													style={{ backgroundColor: eventType.color }}
												/>
											)}
											<span className={styles.eventTypeName}>{eventType.label}</span>
											{hasCount && (
												<span className={styles.eventTypeCount}>({eventType.count})</span>
											)}
										</div>
									)}
								/>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);

	//
}
