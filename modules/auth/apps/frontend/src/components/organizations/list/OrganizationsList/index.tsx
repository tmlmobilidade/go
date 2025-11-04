'use client';

/* * */

import { useOrganizationsListContext } from '@/contexts/OrganizationsList.context';
import { Routes } from '@/lib/routes';
import { type OrganizationNormalized } from '@/types/normalized';
import { DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane, Tag } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';

import { OrganizationsListHeader } from '../OrganizationsListHeader';

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
			width: 50,
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
		const destUrl = keepUrlParams(Routes.ORGANIZATION_DETAIL(item._id), window.location.search);
		router.push(destUrl);
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
