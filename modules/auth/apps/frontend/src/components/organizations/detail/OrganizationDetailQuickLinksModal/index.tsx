'use client';

import { IconChooser } from '@/components/common/IconChooser';
import { HomeLink } from '@tmlmobilidade/types';

/* * */

import { Button, closeModal, Divider, Grid, openModal, Section, TextInput } from '@tmlmobilidade/ui';
import { isUrl } from '@tmlmobilidade/utils';
import { useState } from 'react';

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

	//
	// B. Handle actions

	const handleSave = () => {
		if (!newLink.title || !newLink.href || !newLink.icon) alert('Please preencha todos os campos');
		if (!newLink.href) return alert('Por favor, insira uma URL válida');
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
			<TextInput
				label="Nome"
				onChange={e => setNewLink(prev => ({ ...prev, title: e.target.value }))}
				value={newLink.title}
				required
			/>
			<TextInput
				error={isUrl(newLink.href) ? null : 'Por favor, insira um URL válido'}
				label="Link"
				onChange={e => setNewLink(prev => ({ ...prev, href: e.target.value }))}
				value={newLink.href}
				required
			/>
			<IconChooser selectedIcon={selectedIcon} setSelectedIcon={handleIconChange} />
			<Divider />
			<Grid columns="ab" gap="sm">
				<Button
					label="Cancel"
					onClick={() => closeModal(QUICK_LINKS_MODAL_ID)}
					variant="secondary"
					fullWidth
				/>
				<Button
					disabled={!newLink.title || !newLink.href || !newLink.icon || isUrl(newLink.href) === false}
					label="Save"
					onClick={handleSave}
					variant="primary"
					fullWidth
				/>
			</Grid>
		</Section>
	);

	//
}
