'use client';

import { useOrganizationsDetailContext } from '@/components/organizations/detail/OrganizationDetail.context';
import { iconMap } from '@/lib/icons';
import { HomeLink } from '@tmlmobilidade/types';
import { Button, Collapsible, DataTable, DataTableColumn, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { openOrganizationQuickLinksModal } from '../OrganizationDetailQuickLinksModal';
import { OrganizationDetailQuickLinksActions } from '../OrganizationSectionQuickLinksActions';

/* * */

export function OrganizationDetailQuickLinks() {
	//

	//
	// A. Setup variables

	const organizationDetailContext = useOrganizationsDetailContext();

	const { t } = useTranslation();

	const columns: DataTableColumn<HomeLink & { actions: React.ReactNode }>[] = [
		{
			accessor: 'title',
			title: t('default:organizations.detail.QuickLinks.table.columns.name.label'),
			width: 250,
		},
		{
			accessor: 'href',
			title: t('default:organizations.detail.QuickLinks.table.columns.link.label'),
			width: 400,
		},
		{
			accessor: 'icon',
			render: item => iconMap[item.icon],
			title: t('default:organizations.detail.QuickLinks.table.columns.icon.label'),
			width: 300,
		},
		{
			accessor: 'actions',
			render: item => item.actions,
			title: t('default:organizations.detail.QuickLinks.table.columns.actions.label'),
			width: 300,
		},
	];

	// B. Handle actions
	//

	const handleSubmit = (link: HomeLink) => {
		if (!organizationDetailContext.data.form) return;

		const links = organizationDetailContext.data.form.values.home_links;
		const existingIndex = links.findIndex(l => l.order === link.order);

		if (existingIndex === -1) {
			link.order = links.length;
			organizationDetailContext.data.form.values.home_links = [...links, link];
		}
		else {
			const updatedLinks = links.map((l, idx) => idx === existingIndex ? link : l);
			organizationDetailContext.data.form.values.home_links = updatedLinks;
		}

		organizationDetailContext.actions.save();
	};

	const handleDelete = (link: HomeLink) => {
		if (!organizationDetailContext.data.form) return;
		const updatedLinks = organizationDetailContext.data.form.values.home_links.filter(l => l.title !== link.title);
		organizationDetailContext.data.form.values.home_links = updatedLinks;
		organizationDetailContext.actions.save();
	};

	const handleEdit = (link: HomeLink) => {
		openOrganizationQuickLinksModal({ handleSubmit: handleSubmit, link });
	};

	const quickLinkOptions = useMemo(() => {
		return organizationDetailContext.data.form.values.home_links?.map(link => ({
			...link,
			actions: <OrganizationDetailQuickLinksActions handleDelete={handleDelete} handleEdit={handleEdit} link={link} />,
		}));
	}, [organizationDetailContext.data.form.values.home_links]);

	//
	// C. Render components

	return (
		<Collapsible
			description={t('default:organizations.detail.QuickLinks.description')}
			title={t('default:organizations.detail.QuickLinks.title')}
		>
			<Section gap="lg">
				<Button
					disabled={!organizationDetailContext.data.id}
					label={t('default:organizations.detail.QuickLinks.AddQuickLinkButton.label')}
					onClick={() => openOrganizationQuickLinksModal({ handleSubmit: handleSubmit })}
					variant="primary"
				/>
				{!organizationDetailContext.data.id && (
					<p>{t('default:organizations.detail.QuickLinks.NoOrganizationLabel.label')}</p>
				)}
				{organizationDetailContext.data.id && (
					<DataTable
						columns={columns}
						records={quickLinkOptions}
						rowIdAccessor="title"
					/>
				)}
			</Section>
		</Collapsible>

	);

	//
}
