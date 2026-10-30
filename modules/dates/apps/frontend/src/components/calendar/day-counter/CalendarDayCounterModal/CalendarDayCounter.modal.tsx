'use client';

import { CalendarDayCounter } from '@/components/calendar/day-counter/CalendarDayCounter';
import { CalendarDayCounterContextProvider } from '@/components/calendar/day-counter/CalendarDayCounter.context';
import { closeModal, openModal } from '@tmlmobilidade/ui';

import styles from './CalendarDayCounter.modal.module.css';

/* * */

const MODAL_ID = 'calendar-day-counter-modal';

/* * */

export function openCalendarDayCounterModal(initialAgencyId?: null | string) {
	openModal({
		children: (
			<CalendarDayCounterContextProvider initialAgencyId={initialAgencyId}>
				<CalendarDayCounter />
			</CalendarDayCounterContextProvider>
		),
		classNames: {
			body: styles.body,
			content: styles.content,
		},
		closeOnClickOutside: false,
		closeOnEscape: true,
		modalId: MODAL_ID,
		padding: 0,
		size: '90%',
		withCloseButton: false,
	});
}

/* * */

export function closeCalendarDayCounterModal() {
	closeModal(MODAL_ID);
}
