'use client';

import { useOrganizationsDetailContext } from '@/contexts/OrganizationDetail.context';
import { HomeLink } from '@tmlmobilidade/types';

/* * */

import { iconMap } from '@/lib/icons';
import { Collapsible, DataTable, DataTableColumn, Section, Tag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { OrganizationDetailQuickLinksActions } from '../OrganizationSectionQuickLinksActions';

/* * */

export function OrganizationDetailQuickLinks() {
	//

	//
	// A. Setup variables

	const organizationDetailContext = useOrganizationsDetailContext();

	const quickLinkOptions = useMemo(() => {
		return organizationDetailContext.data.home_links.map(link => ({
			...link,
			actions: <OrganizationDetailQuickLinksActions />,
		}));
	}, [organizationDetailContext.data.home_links]);

	const columns: DataTableColumn<HomeLink & { actions: React.ReactNode }>[] = [
		{
			accessor: 'title',
			title: 'Nome',
			width: 600,
		},
		{
			accessor: 'href',
			title: 'Link',
			width: 600,
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

	//
	// C. Render components

	return (
		<Collapsible
			description="Links rápidos que aparecem na página inicial."
			title="Links rápidos"
		>
			<Section gap="lg">
				<DataTable
					columns={columns}
					records={quickLinkOptions}
					rowIdAccessor="href"
				/>
			</Section>
		</Collapsible>
	);

	//
}
