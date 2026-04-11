'use client';

/* * */

import { EventsContextProvider } from '@/contexts/Events.context';
import { HolidaysContextProvider } from '@/contexts/Holidays.context';
import { PeriodsContextProvider } from '@/contexts/Periods.context';
import { ScheduleRule } from '@tmlmobilidade/types';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

import { RulesCalendarPreview } from './RulesCalendarPreview';

/* * */

const MODAL_ID = 'rule-calendar-preview-modal';

/* * */

export const openRulesCalendarPreviewModal = (agencyId: string, rules: ScheduleRule[]) => {
	openModal({
		children: (
			<MeContextProvider>
				<EventsContextProvider agencyId={agencyId}>
					<PeriodsContextProvider agencyId={agencyId}>
						<HolidaysContextProvider agencyId={agencyId}>
							<RulesCalendarPreview rules={rules} />
						</HolidaysContextProvider>
					</PeriodsContextProvider>
				</EventsContextProvider>
			</MeContextProvider>
		),
		closeOnClickOutside: false,
		closeOnEscape: false,
		modalId: MODAL_ID,
		padding: 0,
		size: '80%',
		styles: {
			body: {
				height: '100%',
			},
			content: {
				height: '85vh',
			},
		},
		withCloseButton: false,
	});
};

/* * */

export const closeRulesCalendarPreviewModal = () => {
	closeModal(MODAL_ID);
};
