'use client';

/* * */

import { OrganizationsListHeader } from '@/components/organizations/list/OrganizationsListHeader';
import { useOrganizationsListContext } from '@/contexts/OrganizationsList.context';
import { type OrganizationNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { DataTable, type DataTableColumn, ErrorDisplay, keepUrlParams, LoadingOverlay, Pane, Tag } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function OrganizationsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const organizationsListContext = useOrganizationsListContext();

	const columns: DataTableColumn<OrganizationNormalized>[] = [
		{
			accessor: '_id',
			render: item => <Tag label={item._id} variant="secondary" />,
			title: '#ID',
			width: 100,
		},
		{
			accessor: 'long_name',
			title: 'Nome',
			width: 600,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: OrganizationNormalized) => {
		router.push(keepUrlParams(PAGE_ROUTES.auth.ORGANIZATIONS_DETAIL(item._id)));
	};

	//
	// C. Render components

	if (organizationsListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (organizationsListContext.flags.error) {
		return <ErrorDisplay message={organizationsListContext.flags.error.message} />;
	}

	return (
		<Pane header={[
			<OrganizationsListHeader />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={organizationsListContext.data.filtered}
				rowIdAccessor="_id"
			/>
		</Pane>
	);

	//
}
