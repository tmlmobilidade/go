'use client';

/* * */

import { AgenciesListHeader } from '@/components/agencies/list/AgenciesListHeader';
import { useAgenciesListContext } from '@/components/agencies/list/AgenciesList.context';
import { type AgencyNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane, Tag } from '@tmlmobilidade/ui';
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
	// B. Handle actions

	const handleRowClick = (item: AgencyNormalized) => {
		router.push(keepUrlParams(PAGE_ROUTES.auth.AGENCIES_DETAIL(item._id)));
	};

	//
	// C. Render components

	if (agenciesListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (agenciesListContext.flags.error) {
		return <ErrorDisplay message={agenciesListContext.flags.error.message} />;
	}

	return (
		<Pane header={[
			<AgenciesListHeader />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={agenciesListContext.data.filtered}
				rowIdAccessor="_id"
			/>
		</Pane>
	);

	//
}
