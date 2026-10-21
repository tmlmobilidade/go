'use client';

import { EventPeriodsProviders } from '@/components/events/shared/EventPeriodsProviders';
import { PeriodAssign } from '@/components/year-periods/calendar/PeriodAssign';
import { PeriodAssignContextProvider } from '@/components/year-periods/calendar/PeriodAssign.context';
import { type CalendarKey } from '@tmlmobilidade/dates';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'assign-period-modal';

/* * */

interface AssignPeriodModalProps {
	dateRange: {
		end: CalendarKey
		start: CalendarKey
	}
}

/* * */

export const openAsignPeriodModal = (dateRange: AssignPeriodModalProps['dateRange'], clearSelection: () => void) => {
	openModal({
		children: (
			<EventPeriodsProviders>
				<MeContextProvider>
					<PeriodAssignContextProvider dateRange={dateRange}>
						<PeriodAssign />
					</PeriodAssignContextProvider>
				</MeContextProvider>
			</EventPeriodsProviders>
		),
		closeOnClickOutside: false,
		closeOnEscape: false,
		modalId: MODAL_ID,
		onClose: () => {
			// Defer clearSelection until after render completes
			setTimeout(clearSelection, 0);
		},
		padding: 0,
		size: 'xl',
		withCloseButton: false,
	});
};

/* * */

export const closeAsignPeriodModal = () => {
	closeModal(MODAL_ID);
};
