'use client';

import { Checkbox } from '@mantine/core';
import React from 'react';

import styles from './styles.module.css';

import { useCalendarUIContext } from '../Calendar/index.context';
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

export function CalendarSidebar({
	eventTypes,
}: CalendarSidebarProps) {
	//

	const context = useCalendarUIContext();

	const handleToggle = (id: string) => {
		context.actions.toggleEventType(id);
	};

	return (
		<div className={styles.sidebar}>
			<MiniCalendar />

			<div className={styles.section}>
				<div className={styles.sectionTitle}>
					Filtrar Eventos
				</div>

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
											<span className={styles.eventTypeName}>
												{eventType.label}
											</span>
											{hasCount && (
												<span className={styles.eventTypeCount}>
													({eventType.count})
												</span>
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
