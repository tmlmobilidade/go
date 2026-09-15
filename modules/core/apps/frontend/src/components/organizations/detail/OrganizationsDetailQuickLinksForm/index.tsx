'use client';

import { closeOrganizationsDetailQuickLinksFormModal } from '@/components/organizations/detail/OrganizationsDetailQuickLinksForm.modal';
import { OrganizationsDetailQuickLinksIconChooser } from '@/components/organizations/detail/OrganizationsDetailQuickLinksIconChooser';
import { type HomeQuickLink } from '@tmlmobilidade/go-types-core';
import { isUrl } from '@tmlmobilidade/strings';
import { Button, Divider, Grid, Section, TextInput } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

/**
 * A quick link being created or edited. New links have no order yet;
 * the order is assigned when the link is appended to the list.
 */
export type OrganizationsDetailQuickLinksFormValue = Omit<HomeQuickLink, 'order'> & Partial<Pick<HomeQuickLink, 'order'>>;

interface OrganizationsDetailQuickLinksFormProps {
	link?: HomeQuickLink
	onSubmit: (link: OrganizationsDetailQuickLinksFormValue) => void
}

/* * */

export function OrganizationsDetailQuickLinksForm({ link, onSubmit }: OrganizationsDetailQuickLinksFormProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [newLink, setNewLink] = useState<OrganizationsDetailQuickLinksFormValue>(link || { href: '', icon: '', title: '' });

	//
	// B. Handle actions

	const handleSave = () => {
		if (!newLink.title || !newLink.href || !newLink.icon) alert(t('default:organizations.detail.QuickLinksModal.Error.message'));
		if (!newLink.href) return alert(t('default:organizations.detail.QuickLinksModal.Error.title'));
		closeOrganizationsDetailQuickLinksFormModal();
		onSubmit(newLink);
	};

	const handleIconChange = (icon: string) => {
		setNewLink(prev => ({ ...prev, icon }));
	};

	//
	// C. Setup flags

	const isSaveDisabled = !newLink.title || !newLink.href || !newLink.icon || !isUrl(newLink.href);

	//
	// D. Render components

	return (
		<Section flexDirection="column" gap="sm" padding="lg">
			<TextInput
				key="link-title"
				label={t('default:organizations.detail.QuickLinksModal.Fields.title.label')}
				onChange={e => setNewLink(prev => ({ ...prev, title: e.target.value }))}
				value={newLink.title}
				required
			/>
			<TextInput
				key="link-href"
				error={isUrl(newLink.href) ? null : t('default:organizations.detail.QuickLinksModal.Error.title')}
				label={t('default:organizations.detail.QuickLinksModal.Fields.link.label')}
				onChange={e => setNewLink(prev => ({ ...prev, href: e.target.value }))}
				value={newLink.href}
				required
			/>
			<OrganizationsDetailQuickLinksIconChooser
				onChange={handleIconChange}
				value={newLink.icon}
			/>
			<Divider />
			<Grid columns="ab" gap="sm">
				<Button
					label={t('default:organizations.detail.QuickLinksModal.Fields.cancel.label')}
					onClick={closeOrganizationsDetailQuickLinksFormModal}
					variant="secondary"
					fullWidth
				/>
				<Button
					disabled={isSaveDisabled}
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
