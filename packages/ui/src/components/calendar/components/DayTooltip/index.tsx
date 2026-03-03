'use client';

import { type CalendarEvent, type CalendarEventMetadata } from '@tmlmobilidade/types';
import React from 'react';

import styles from './styles.module.css';

/* * */

export interface DayTooltipProps {
	calendarEvents: CalendarEvent[]
	date: string
}

interface RuleImpactMetadata {
	timepoints?: string[] // "HH:mm"
}

/* * */

export function DayTooltip({ calendarEvents, date }: DayTooltipProps) {
	//

	if (calendarEvents.length === 0) {
		return null;
	}

	// Separate periods and other events
	const periods = calendarEvents.filter(e => e.type === 'period');
	const annotations = calendarEvents.filter(e => e.type === 'annotation');
	const holidays = calendarEvents.filter(e => e.type === 'holiday');
	const events = calendarEvents.filter(e => e.type === 'event');
	const ruleImpacts = calendarEvents.filter(e => e.type === 'rule-impact');
	const affectedTimepoints = Array
		.from(new Set(
			ruleImpacts.flatMap((e) => {
				const md = e.metadata as RuleImpactMetadata | undefined;
				return md?.timepoints ?? [];
			}),
		))
		.sort();

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
									{metadata?.agency_names && (
										<div className={styles.eventMeta}>
											{metadata.agency_names.length > 1 ? 'Operadores' : 'Operador'}: {metadata.agency_names}
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}

			{annotations.length > 0 && (
				<div className={styles.section}>
					<div className={styles.sectionTitle}>Anotações</div>
					{annotations.map((event) => {
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

			{holidays.length > 0 && (
				<div className={styles.section}>
					<div className={styles.sectionTitle}>Feriados</div>
					{holidays.map((event) => {
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

			{events.length > 0 && (
				<div className={styles.section}>
					<div className={styles.sectionTitle}>Eventos</div>
					{events.map((event) => {
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

			{affectedTimepoints.length > 0 && (
				<div className={styles.section}>
					<div className={styles.sectionTitle}>Oferta</div>

					<div className={styles.event}>
						<div
							className={styles.eventColor}
							style={{ backgroundColor: 'var(--color-primary)' }}
						/>
						<div className={styles.eventContent}>
							<div className={styles.eventTitle}>{affectedTimepoints.join(', ')}</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);

	//
}
