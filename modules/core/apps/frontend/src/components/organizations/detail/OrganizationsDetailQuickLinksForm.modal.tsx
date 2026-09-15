'use client';

import { OrganizationsDetailQuickLinksForm, type OrganizationsDetailQuickLinksFormValue } from '@/components/organizations/detail/OrganizationsDetailQuickLinksForm';
import { type HomeQuickLink } from '@tmlmobilidade/go-types-core';
import { closeModal, openModal } from '@tmlmobilidade/ui';

/* * */

const MODAL_ID = 'organizations-detail-quick-links-form-modal';

/* * */

interface OpenOrganizationsDetailQuickLinksFormModalParams {
	link?: HomeQuickLink
	onSubmit: (link: OrganizationsDetailQuickLinksFormValue) => void
}

/* * */

export const openOrganizationsDetailQuickLinksFormModal = ({ link, onSubmit }: OpenOrganizationsDetailQuickLinksFormModalParams) => {
	openModal({
		children: (
			<OrganizationsDetailQuickLinksForm link={link} onSubmit={onSubmit} />
		),
		closeOnClickOutside: false,
		modalId: MODAL_ID,
		padding: 0,
		size: 'xl',
		styles: { content: { overflow: 'unset' } },
		withCloseButton: false,
	});
};

/* * */

export const closeOrganizationsDetailQuickLinksFormModal = () => {
	closeModal(MODAL_ID);
};
