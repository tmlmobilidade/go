'use client';

import { IconChooser } from '@/components/common/IconChooser';
import { useOrganizationsDetailContext } from '@/components/organizations/detail/OrganizationDetail.context';
import { HomeLink } from '@tmlmobilidade/types';

/* * */

import { isUrl } from '@tmlmobilidade/strings';
import { Button, closeModal, ContextFormController, Divider, Grid, openModal, Section, TextInput } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export const QUICK_LINKS_MODAL_ID = 'quick-links-modal';

/* * */

export interface QuickLinksModalProps {
	handleSubmit?: (link: HomeLink) => void
	link?: HomeLink
}

/* * */

export const openOrganizationQuickLinksModal = ({ handleSubmit, link }: QuickLinksModalProps) => {
	openModal({
		children: (
			<QuickLinksModal handleSubmit={handleSubmit} link={link} />
		),
		closeOnClickOutside: false,
		modalId: QUICK_LINKS_MODAL_ID,
		padding: 0,
		size: 'xl',
		styles: { content: { overflow: 'unset' } },
		withCloseButton: false,
	});
};

/* * */

export default function QuickLinksModal({ handleSubmit, link }: { handleSubmit?: (link: Omit<HomeLink, 'order'>) => void, link?: HomeLink }) {
	//

	//
	// A. Setup variables

	const [newLink, setNewLink] = useState<Omit<HomeLink, 'order'>>(link || { href: '', icon: '', title: '' });
	const [selectedIcon, setSelectedIcon] = useState<'' | string>(link?.icon || '');

	const { t } = useTranslation();
	const organizationDetailContext = useOrganizationsDetailContext();

	//
	// B. Handle actions

	const handleSave = () => {
		if (!newLink.title || !newLink.href || !newLink.icon) alert(t('default:organizations.detail.QuickLinksModal.Error.message'));
		if (!newLink.href) return alert(t('default:organizations.detail.QuickLinksModal.Error.title'));
		closeModal(QUICK_LINKS_MODAL_ID);
		handleSubmit(newLink);
	};

	const handleIconChange = (icon) => {
		newLink.icon = icon;
		setSelectedIcon(icon);
	};

	//
	// C. Render components

	return (
		<Section flexDirection="column" gap="sm" padding="lg">
			<ContextFormController
				control={organizationDetailContext.form.instance.control}
				name="href"
				render={({ field }) => (
					<TextInput
						key="link-href"
						error={isUrl(field.value) ? null : t('default:organizations.detail.QuickLinksModal.Error.title')}
						label={t('default:organizations.detail.QuickLinksModal.Fields.link.label')}
						onChange={e => setNewLink(prev => ({ ...prev, href: e.target.value }))}
						value={field.value}
						required
					/>
				)}
			/>

			<ContextFormController
				control={organizationDetailContext.form.instance.control}
				name="href"
				render={({ field }) => (
					<TextInput
						key="link-href"
						error={isUrl(field.value) ? null : t('default:organizations.detail.QuickLinksModal.Error.title')}
						label={t('default:organizations.detail.QuickLinksModal.Fields.link.label')}
						onChange={e => setNewLink(prev => ({ ...prev, href: e.target.value }))}
						value={field.value}
						required
					/>
				)}
			/>

			<IconChooser selectedIcon={selectedIcon} setSelectedIcon={handleIconChange} />
			<Divider />
			<Grid columns="ab" gap="sm">
				<Button
					label={t('default:organizations.detail.QuickLinksModal.Fields.cancel.label')}
					onClick={() => closeModal(QUICK_LINKS_MODAL_ID)}
					variant="secondary"
					fullWidth
				/>
				<Button
					disabled={!newLink.title || !newLink.href || !newLink.icon || isUrl(newLink.href) === false}
					label={t('default:organizations.detail.QuickLinksModal.Fields.save.label')}
					onClick={handleSave}
					variant="primary"
					fullWidth
				/>
			</Grid>
		</Section>
	);

	//
}
