'use client';

import { PeriodAssign } from '@/components/year-periods/calendar/PeriodAssign';
import { PeriodAssignContextProvider } from '@/components/year-periods/calendar/PeriodAssign.context';
import { DataProviders } from '@/providers/data-providers';
import { CalendarKey } from '@tmlmobilidade/dates';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'create-annotation-modal';

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
			<DataProviders>
				<MeContextProvider>
					<PeriodAssignContextProvider dateRange={dateRange}>
						<PeriodAssign />
					</PeriodAssignContextProvider>
				</MeContextProvider>
			</DataProviders>
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
