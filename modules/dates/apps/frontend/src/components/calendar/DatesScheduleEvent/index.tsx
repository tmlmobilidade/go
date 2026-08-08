import { EVENT_TYPE_DEFS, type ScheduleEventData, Tooltip } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { isDatesSchedulePayload } from '../DatesSchedule/dates-schedule-events';

/* * */

interface DatesScheduleEventProps {
	event: ScheduleEventData
}

/* * */

export function DatesScheduleEvent({ event }: DatesScheduleEventProps) {
	const payload = isDatesSchedulePayload(event.payload) ? event.payload : undefined;
	const Icon = payload ? EVENT_TYPE_DEFS[payload.type].icon : undefined;
	const agencyNames = payload?.agencyNames?.join(', ');

	const tooltip = (
		<div className={styles.tooltip}>
			<strong>{event.title}</strong>
			{payload?.description && <span>{payload.description}</span>}
			{agencyNames && <span>{agencyNames}</span>}
		</div>
	);

	return (
		<Tooltip label={tooltip} multiline>
			<span className={styles.event}>
				{Icon && <Icon size={14} aria-hidden />}
				<span>{event.title}</span>
			</span>
		</Tooltip>
	);
}
