'use client';

import { iconMap } from '@/lib/icons';
import { HomeQuickLink } from '@tmlmobilidade/go-types-core';
import { Button, Collapsible, DataTable, DataTableColumn, DataTableScroller, DeleteButton, EditButton, Section, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useCallback } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { openOrganizationQuickLinksModal } from '../OrganizationDetailQuickLinksModal';
import { useOrganizationsDetailFormContext } from '../OrganizationsDetailForm.context';

/* * */

export function OrganizationsDetailQuickLinks() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { form } = useOrganizationsDetailFormContext();

	const homeLinksValue = useStandardFormWatch({ control: form.control, name: 'home_links' });

	const columns: DataTableColumn<HomeQuickLink>[] = [
		{
			accessor: 'actions',
			render: item => (
				<Section flexDirection="row" gap="sm" padding="none">
					<EditButton onEdit={() => handleEdit(item)} />
					<DeleteButton onDelete={() => handleDelete(item)} />
				</Section>
			),
			title: t('default:organizations.detail.QuickLinks.table.columns.actions.label'),
			width: 120,
		},
		{
			accessor: 'icon',
			center: true,
			render: item => iconMap[item.icon],
			title: t('default:organizations.detail.QuickLinks.table.columns.icon.label'),
			width: 75,
		},
		{
			accessor: 'title',
			title: t('default:organizations.detail.QuickLinks.table.columns.name.label'),
			width: 300,
		},
		{
			accessor: 'href',
			title: t('default:organizations.detail.QuickLinks.table.columns.link.label'),
			width: 500,
		},
	];

	//
	// B. Handle actions

	const handleSubmit = useCallback((link: HomeQuickLink) => {
		// Get the index of the link with the same order
		const existingIndex = homeLinksValue.findIndex(l => l.order === link.order);
		// If the link does not exist, add it to the end of the list
		if (existingIndex === -1) {
			link.order = homeLinksValue.length;
			form.setValue('home_links', [...homeLinksValue, link], { shouldDirty: true });
		} else {
			const updatedLinks = homeLinksValue.map((l, idx) => idx === existingIndex ? link : l);
			form.setValue('home_links', updatedLinks, { shouldDirty: true });
		}
	}, [form, homeLinksValue]);

	const handleDelete = useCallback((link: HomeQuickLink) => {
		const updatedLinks = homeLinksValue.filter(l => l.title !== link.title);
		form.setValue('home_links', updatedLinks, { shouldDirty: true });
	}, [form, homeLinksValue]);

	const handleEdit = useCallback((link: HomeQuickLink) => {
		openOrganizationQuickLinksModal({ handleSubmit: handleSubmit, link });
	}, [handleSubmit]);

	//
	// C. Render components

	return (
		<Collapsible
			description={t('default:organizations.detail.QuickLinks.description')}
			title={t('default:organizations.detail.QuickLinks.title')}
		>
			<DataTableScroller>
				<DataTable
					columns={columns}
					records={homeLinksValue}
					rowIdAccessor="title"
				/>
			</DataTableScroller>
			<Section gap="lg">
				<Button
					label={t('default:organizations.detail.QuickLinks.AddQuickLinkButton.label')}
					onClick={() => openOrganizationQuickLinksModal({ handleSubmit: handleSubmit })}
					variant="primary"
				/>
			</Section>
		</Collapsible>
	);
}
