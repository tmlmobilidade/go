'use client';

import { useOrganizationsDetailContext } from '@/contexts/OrganizationDetail.context';
import { HomeLink } from '@tmlmobilidade/types';

/* * */

import { iconMap } from '@/lib/icons';
import { Button, Collapsible, DataTable, DataTableColumn, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import React from 'react';

import { openOrganizationQuickLinksModal } from '../OrganizationDetailQuickLinksModal';
import { OrganizationDetailQuickLinksActions } from '../OrganizationSectionQuickLinksActions';

/* * */

export function OrganizationDetailQuickLinks() {
	//

	//
	// A. Setup variables

	const organizationDetailContext = useOrganizationsDetailContext();

	const columns: DataTableColumn<HomeLink & { actions: React.ReactNode }>[] = [
		{
			accessor: 'title',
			title: 'Nomer',
			width: 250,
		},
		{
			accessor: 'href',
			title: 'Link',
			width: 400,
		},
		{
			accessor: 'icon',
			render: item => iconMap[item.icon],
			title: 'Ícone',
			width: 300,
		},
		{
			accessor: 'actions',
			render: item => item.actions,
			title: 'Ações',
			width: 300,
		},
	];

	// B. Handle actions
	//

	const onSubmit = (link: HomeLink) => {
		if (!organizationDetailContext.data.form) return;
		const updatedLinks = organizationDetailContext.data.form.values.home_links.map(l => l.title === link.title ? link : l);
		organizationDetailContext.data.form.values.home_links = updatedLinks;
		organizationDetailContext.actions.saveOrganization();
	};

	const handleDelete = (link: HomeLink) => {
		if (!organizationDetailContext.data.form) return;
		const updatedLinks = organizationDetailContext.data.form.values.home_links.filter(l => l.title !== link.title);
		organizationDetailContext.data.form.values.home_links = updatedLinks;
		organizationDetailContext.actions.saveOrganization();
	};

	const handleEdit = (link: HomeLink) => {
		openOrganizationQuickLinksModal({ link, organization_id: organizationDetailContext.data.id });
	};

	const quickLinkOptions = useMemo(() => {
		return organizationDetailContext.data.form.values.home_links.map(link => ({
			...link,
			actions: <OrganizationDetailQuickLinksActions handleDelete={handleDelete} handleEdit={handleEdit} link={link} />,
		}));
	}, [organizationDetailContext.data.form]);

	//
	// C. Render components

	return (
		<Collapsible
			description="Links rápidos que aparecem na página inicial."
			title="Links rápidos"
		>
			<Section gap="lg">
				<Button
					label="Adicionar link rápido"
					onClick={() => openOrganizationQuickLinksModal({ onSubmit, organization_id: organizationDetailContext.data.id })}
					variant="primary"
				/>
				<DataTable
					columns={columns}
					records={quickLinkOptions}
					rowIdAccessor="title"
				/>
			</Section>
		</Collapsible>

	);

	//
}
