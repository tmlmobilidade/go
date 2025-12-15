'use client';

import { type CalendarEvent, type CalendarEventMetadata } from '@tmlmobilidade/types';
import React from 'react';

import styles from './styles.module.css';

/* * */

export interface DayTooltipProps {
	date: string
	events: CalendarEvent[]
}

/* * */

export function DayTooltip({ date, events }: DayTooltipProps) {
	//

	if (events.length === 0) {
		return null;
	}

	// Separate periods and other events
	const periods = events.filter(e => e.type === 'period');
	const otherEvents = events.filter(e => e.type !== 'period');

	return (
		<div className={styles.container}>
			<div className={styles.date}>{date}</div>

			{periods.length > 0 && (
				<div className={styles.section}>
					<div className={styles.sectionTitle}>Períodos</div>
					{periods.map((period) => {
						const metadata = period.metadata as CalendarEventMetadata;
						return (
							<div key={period.id} className={styles.event}>
								<div
									className={styles.eventColor}
									style={{ backgroundColor: period.color || '#3b82f6' }}
								/>
								<div className={styles.eventContent}>
									<div className={styles.eventTitle}>{period.title}</div>
									{metadata?.agency_name && (
										<div className={styles.eventMeta}>
											Operador: {metadata.agency_name}
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}

			{otherEvents.length > 0 && (
				<div className={styles.section}>
					<div className={styles.sectionTitle}>Eventos</div>
					{otherEvents.map((event) => {
						const Icon = event.icon;
						return (
							<div key={event.id} className={styles.event}>
								{Icon && (
									<div className={styles.eventIcon}>
										<Icon size={14} />
									</div>
								)}
								<div className={styles.eventContent}>
									<div className={styles.eventTitle}>{event.title}</div>
									{event.description && (
										<div className={styles.eventMeta}>
											{event.description}
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);

	//
}
