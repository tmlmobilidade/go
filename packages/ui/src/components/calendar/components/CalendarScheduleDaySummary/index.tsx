import { type ScheduleEventData, type ScheduleProps } from '@mantine/schedule';
import { type CSSProperties } from 'react';

import styles from './styles.module.css';

import { EVENT_TYPE_DEFS } from '../../../../icons/event-types';
import { type CalendarScheduleEventType, type CalendarSchedulePayload, isCalendarSchedulePayload } from '../../utils/calendar-schedule-events';

/* * */

const EVENT_TYPE_ORDER: CalendarScheduleEventType[] = ['period', 'holiday', 'annotation', 'event', 'rule-impact'];

const EVENT_TYPE_LABELS: Record<CalendarScheduleEventType, string> = {
	'annotation': 'Anotações',
	'event': 'Eventos',
	'holiday': 'Feriados',
	'period': 'Períodos',
	'rule-impact': 'Dias afetados',
};

/* * */

export interface CalendarScheduleDaySummaryProps {
	date: string
	events: ScheduleEventData[]
	locale: string
	onEventClick?: ScheduleProps['onEventClick']
}

/* * */

function formatDate(date: string, locale: string) {
	const formattedDate = new Intl.DateTimeFormat(locale, {
		dateStyle: 'full',
		timeZone: 'UTC',
	}).format(new Date(`${date}T00:00:00Z`));

	return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}

/* * */

export function CalendarScheduleDaySummary({ date, events, locale, onEventClick }: CalendarScheduleDaySummaryProps) {
	//

	//
	// A. Setup variables

	const scheduleEvents = events.filter((event): event is ScheduleEventData<CalendarSchedulePayload> => isCalendarSchedulePayload(event.payload));
	const groupedEvents = EVENT_TYPE_ORDER.map(type => ({
		events: scheduleEvents.filter(event => event.payload.type === type),
		label: EVENT_TYPE_LABELS[type],
		type,
	})).filter(group => group.events.length > 0);

	//
	// B. Render components

	return (
		<div className={styles.summary}>
			<div className={styles.date}>{formatDate(date, locale)}</div>

			{groupedEvents.map(group => (
				<section key={group.type} className={styles.section}>
					<div className={styles.sectionTitle}>
						<span>{group.label}</span>
						<span className={styles.sectionCount}>{group.events.length}</span>
					</div>

					<div className={styles.eventList}>
						{group.events.map((event) => {
							const Icon = EVENT_TYPE_DEFS[group.type].icon;
							const agencyNames = event.payload.agencyNames;

							return (
								<button
									key={event.id}
									className={styles.event}
									data-type={group.type}
									disabled={!onEventClick}
									style={group.type === 'period' && event.color ? { '--event-type-color': event.color } as CSSProperties : undefined}
									type="button"
									onClick={(clickEvent) => {
										clickEvent.stopPropagation();
										onEventClick?.(event, clickEvent);
									}}
								>
									{Icon && <Icon className={styles.eventIcon} size={16} aria-hidden />}
									<div className={styles.eventContent}>
										<div className={styles.eventTitle}>{event.title}</div>
										{agencyNames && agencyNames.length > 0 && (
											<div className={styles.eventMeta}>
												{agencyNames.length === 1 ? 'Operador' : 'Operadores'}: {agencyNames.join(', ')}
											</div>
										)}
										{event.payload.description && <div className={styles.eventMeta}>{event.payload.description}</div>}
									</div>
								</button>
							);
						})}
					</div>
				</section>
			))}
		</div>
	);

	//
}
