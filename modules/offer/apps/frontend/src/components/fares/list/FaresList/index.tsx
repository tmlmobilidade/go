'use client';

/* * */

import { useFaresListContext } from '@/components/fares/list/FaresList.context';
import { FaresListCellAgencies } from '@/components/fares/list/FaresListCellAgencies';
import { FaresListFiltersBar } from '@/components/fares/list/FaresListFiltersBar';
import { FaresListHeader } from '@/components/fares/list/FaresListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Fare } from '@tmlmobilidade/types';
import { DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane, Tag, Text } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';

/* * */

export function FaresList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const faresList = useFaresListContext();

	const columns: DataTableColumn<Fare>[] = [
		{
			accessor: '_id',
			render: item => <Tag label={item._id} variant="secondary" />,
			title: '#ID',
			width: 100,
		},
		{
			accessor: 'code',
			render: item => <Text>{item.code}</Text>,
			title: 'Código',
			width: 200,
		},
		{
			accessor: 'name',
			render: item => <Text>{item.name}</Text>,
			title: 'Nome',
			width: 300,
		},
		{
			accessor: 'agency_ids',
			render: item => <FaresListCellAgencies agencyIds={item.agency_ids} />,
			title: 'Operadores',
			width: 200,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: Fare) => {
		router.push(keepUrlParams(PAGE_ROUTES.offer.FARES_DETAIL(item._id)));
	};

	//
	// C. Render components

	if (faresList.flags.loading) {
		return <LoadingOverlay />;
	}

	if (faresList.flags.error) {
		return <ErrorDisplay message={faresList.flags.error.message} />;
	}

	return (
		<Pane header={[
			<FaresListHeader />,
			<FaresListFiltersBar />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={faresList.data.filtered}
				rowIdAccessor="_id"
				selectedId={params.id}
			/>
		</Pane>
	);

	//
}
