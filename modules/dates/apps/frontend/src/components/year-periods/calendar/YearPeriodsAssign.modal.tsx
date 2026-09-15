'use client';

import { YearPeriodsAssign } from '@/components/year-periods/calendar/YearPeriodsAssign';
import { type YearPeriodsAssignDateRange, YearPeriodsAssignFormContextProvider } from '@/components/year-periods/calendar/YearPeriodsAssignForm.context';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'year-periods-assign-modal';

/* * */

export const openYearPeriodsAssignModal = (dateRange: YearPeriodsAssignDateRange, clearSelection: () => void) => {
	openModal({
		children: (
			<YearPeriodsAssignFormContextProvider dateRange={dateRange}>
				<YearPeriodsAssign />
			</YearPeriodsAssignFormContextProvider>
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

export const closeYearPeriodsAssignModal = () => {
	closeModal(MODAL_ID);
};
