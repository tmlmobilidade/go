'use client';

/* * */

import { useZonesListContext } from '@/components/zones/list/ZonesList.context';
import { ZonesListCellAgencies } from '@/components/zones/list/ZonesListCellAgencies';
import { ZonesListFiltersBar } from '@/components/zones/list/ZonesListFiltersBar';
import { ZonesListHeader } from '@/components/zones/list/ZonesListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Zone } from '@tmlmobilidade/types';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, LoadingOverlay, Pane, Text } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';

/* * */

export function ZonesList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const zonesList = useZonesListContext();

	const columns: DataTableColumn<Zone>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
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
			render: item => <ZonesListCellAgencies agencyIds={item.agency_ids} />,
			title: 'Operadores',
			width: 200,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: Zone) => {
		router.push(keepUrlParams(PAGE_ROUTES.offer.ZONES_DETAIL(item._id)));
	};

	//
	// C. Render components

	if (zonesList.flags.loading) {
		return <LoadingOverlay />;
	}

	if (zonesList.flags.error) {
		return <ErrorDisplay message={zonesList.flags.error.message} />;
	}

	return (
		<Pane header={[
			<ZonesListHeader key="header" />,
			<ZonesListFiltersBar key="filters" />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={zonesList.data.filtered}
				rowIdAccessor="_id"
				selectedId={params.id}
			/>
		</Pane>
	);

	//
}
