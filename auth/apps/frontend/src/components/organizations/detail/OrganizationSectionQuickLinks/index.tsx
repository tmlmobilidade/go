'use client';

import { useOrganizationsDetailContext } from '@/contexts/OrganizationDetail.context';
import { QuickLink } from '@tmlmobilidade/types';

/* * */

import { Collapsible, DataTable, DataTableColumn, Grid, Section, Tag } from '@tmlmobilidade/ui';

/* * */

export function OrganizationDetailQuickLinks() {
	//

	//
	// A. Setup variables

	const organizationDetailContext = useOrganizationsDetailContext();

	const columns: DataTableColumn<QuickLink>[] = [
		{
			accessor: '_id',
			render: item => <Tag label={item._id} variant="secondary" />,
			title: '#ID',
			width: 50,
		},
		{
			accessor: 'title',
			title: 'Nome',
			width: 600,
		},
		{
			accessor: 'href',
			title: 'Nome',
			width: 600,
		},
		{
			accessor: 'icon',
			title: 'Nome',
			width: 600,
		},
	];

	//
	// B. Handle actions

	const handleAddQuickLink = (item: QuickLink) => {
		const exists = organizationDetailContext.data.form.values.home_links.find(link => link._id === item._id);
		if (!exists) {
			organizationDetailContext.data.form.insertListItem('home_links', item);
		}
	};

	//
	// C. Render components

	return (
		<Collapsible
			description="Links rápidos que aparecem na página inicial."
			title="Links rápidos"
		>
			<Section gap="lg">
				<Grid columns="ab" gap="lg">
					<DataTable
						columns={columns}
						records={organizationDetailContext.data.home_links}
						rowIdAccessor="_id"
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
