'use client';

/* * */

import { AgenciesListHeader } from '@/components/agencies/list/AgenciesListHeader';
import { useAgenciesListContext } from '@/contexts/AgenciesList.context';
import { Routes } from '@/lib/routes';
import { type AgencyNormalized } from '@/types/normalized';
import { DataTable, type DataTableColumn, LoadingOverlay, Pane, Tag } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function AgenciesList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const agenciesListContext = useAgenciesListContext();

	const columns: DataTableColumn<AgencyNormalized>[] = [
		{
			accessor: '_id',
			render: item => <Tag label={item._id} variant="secondary" />,
			title: '#ID',
			width: 50,
		},
		{
			accessor: 'name',
			title: 'Nome',
			width: 600,
		},
	];

	//
	// B. Render components

	if (agenciesListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (agenciesListContext.flags.error) {
		return <div>Error: {agenciesListContext.flags.error.message}</div>;
	}

	return (
		<Pane header={[
			<AgenciesListHeader />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={item => router.push(Routes.AGENCY_DETAIL(item._id))}
				records={agenciesListContext.data.filtered}
				rowIdAccessor="_id"
			/>
		</Pane>
	);

	//
}
