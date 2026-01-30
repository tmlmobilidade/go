'use client';

/* * */

import { PeriodsContextProvider } from '@/contexts/Periods.context';
import { closeModal, MeContextProvider, openModal } from '@tmlmobilidade/ui';

import { RulesCalendarPreview } from './RulesCalendarPreview';

/* * */

const MODAL_ID = 'rule-calendar-preview-modal';

/* * */

export const openRulesCalendarPreviewModal = (agencyId: string, rulesPreview) => {
	openModal({
		children: (
			<MeContextProvider>
				<PeriodsContextProvider agencyId={agencyId}>
					<RulesCalendarPreview rulesPreview={rulesPreview} />
				</PeriodsContextProvider>
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
