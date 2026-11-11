import { Tooltip } from '@mantine/core';
import { type ScheduleEventData } from '@mantine/schedule';

import styles from './styles.module.css';

import { EVENT_TYPE_DEFS } from '../../../../icons/event-types';
import { isCalendarSchedulePayload } from '../../utils/calendar-schedule-events';

/* * */

export interface CalendarScheduleEventProps {
	event: ScheduleEventData
	withTooltip?: boolean
}

/* * */

export function CalendarScheduleEvent({ event, withTooltip = true }: CalendarScheduleEventProps) {
	//

	// A. Setup variables

	const payload = isCalendarSchedulePayload(event.payload) ? event.payload : undefined;
	const Icon = payload ? EVENT_TYPE_DEFS[payload.type].icon : undefined;
	const agencyNames = payload?.agencyNames?.join(', ');

	// B. Render components

	const tooltip = (
		<div className={styles.tooltip}>
			<strong>{event.title}</strong>
			{payload?.description && <span>{payload.description}</span>}
			{agencyNames && <span>{agencyNames}</span>}
		</div>
	);

	const content = (
		<span className={styles.event} data-period={payload?.type === 'period' || undefined}>
			{Icon && <Icon size={14} aria-hidden />}
			<span>{event.title}</span>
		</span>
	);

	return withTooltip ? <Tooltip label={tooltip} multiline>{content}</Tooltip> : content;
}
