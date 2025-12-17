'use client';

import { type CalendarEvent } from '@tmlmobilidade/types';
import React from 'react';

import styles from './styles.module.css';

/* * */

export interface CalendarEventProps {
	event: CalendarEvent
	isEnd?: boolean
	isMiddle?: boolean
	isStart?: boolean
	onClick?: (event: CalendarEvent) => void
}

/* * */

export function CalendarEventComponent({ event, isEnd = true, isMiddle = false, isStart = true, onClick }: CalendarEventProps) {
	//

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onClick) {
			onClick(event);
		}
	};

	const Icon = event.icon;

	// Build className based on position in multi-day event
	const isSingleDay = isStart && isEnd;
	const positionClasses = [
		event.type !== 'period' ? styles.event : '',
		styles[`${event.type}`],
		!isSingleDay && isStart && !isEnd && styles.eventStart,
		!isSingleDay && isMiddle && styles.eventMiddle,
		!isSingleDay && isEnd && !isStart && styles.eventEnd,
	].filter(Boolean).join(' ');

	return (
		<div
			className={positionClasses}
			onClick={handleClick}
			style={{ backgroundColor: event.color }}
			title={event.description || event.title}
		>
			{Icon && isStart && <Icon className={styles.eventIcon} size={14} />}
			{event.type !== 'period' && event.title && isStart && (
				<span className={styles.eventTitle}>
					{event.title}
				</span>
			)}
		</div>
	);
}
