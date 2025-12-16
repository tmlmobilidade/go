'use client';

import { IconChooser } from '@/components/common/IconChooser';
import { HomeLink } from '@tmlmobilidade/types';

/* * */

import { isUrl } from '@tmlmobilidade/strings';
import { Button, closeModal, Divider, Grid, openModal, Section, TextInput } from '@tmlmobilidade/ui';
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
		size: 'auto',
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

	const { t } = useTranslation('auth', { keyPrefix: 'organizations.detail.QuickLinksModal' });

	//
	// B. Handle actions

	const handleSave = () => {
		if (!newLink.title || !newLink.href || !newLink.icon) alert(t('error.missing_fields'));
		if (!newLink.href) return alert(t('error.wrong_url'));
		closeModal(QUICK_LINKS_MODAL_ID);
		handleSubmit(newLink);
	};

	const handleIconChange = (icon) => {
		newLink.icon = icon;
		setSelectedIcon(icon);
	};

	console.log('Loaded i18n namespaces:', useTranslation().i18n.options?.ns);
	//
	// C. Render components

	return (
		<Section flexDirection="column" gap="sm" padding="lg">
			<TextInput
				key="link-title"
				label={t('fields.title')}
				onChange={e => setNewLink(prev => ({ ...prev, title: e.target.value }))}
				value={newLink.title}
				required
			/>
			<TextInput
				key="link-href"
				error={isUrl(newLink.href) ? null : 'Por favor, insira um URL válido'}
				label={t('fields.link')}
				onChange={e => setNewLink(prev => ({ ...prev, href: e.target.value }))}
				value={newLink.href}
				required
			/>
			<IconChooser selectedIcon={selectedIcon} setSelectedIcon={handleIconChange} />
			<Divider />
			<Grid columns="ab" gap="sm">
				<Button
					label={t('fields.cancel')}
					onClick={() => closeModal(QUICK_LINKS_MODAL_ID)}
					variant="secondary"
					fullWidth
				/>
				<Button
					disabled={!newLink.title || !newLink.href || !newLink.icon || isUrl(newLink.href) === false}
					label={t('fields.save')}
					onClick={handleSave}
					variant="primary"
					fullWidth
				/>
			</Grid>
		</Section>
	);

	//
}
