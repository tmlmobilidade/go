'use client';

/* * */

import { useVehiclesListContext } from '@/components/Vehicles/list/VehiclesList.context';
import { VehiclesListCellAgencies } from '@/components/Vehicles/list/VehiclesListCellAgencies';
import { VehiclesListCellDates } from '@/components/Vehicles/list/VehiclesListCellDates';
import { VehiclesListFiltersBar } from '@/components/Vehicles/list/VehiclesListFiltersBar';
import { VehiclesListHeader } from '@/components/Vehicles/list/VehiclesListHeader';
import { VehicleNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane, Tag } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';

/* * */

export function VehiclesList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const VehiclesListContext = useVehiclesListContext();

	const columns: DataTableColumn<VehicleNormalized>[] = [
		{
			accessor: '_id',
			render: item => <Tag label={item._id} variant="secondary" />,
			title: '#ID',
			width: 100,
		},
		{
			accessor: 'title',
			title: 'Título',
			width: 400,
		},
		{
			accessor: 'agency_id',
			render: item => <VehiclesListCellAgencies agencyIds={item.agency_id} />,
			title: 'Operadores',
			width: 200,
		},
		{
			accessor: 'registration_date',
			render: item => <VehiclesListCellDates dates={item.registration_date} />,
			title: 'Datas',
			width: 500,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: VehicleNormalized) => {
		router.push(keepUrlParams(PAGE_ROUTES.fleet.VEHICLES_DETAIL(item._id)));
	};

	//
	// C. Render components

	if (VehiclesListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (VehiclesListContext.flags.error) {
		return <ErrorDisplay message={VehiclesListContext.flags.error.message} />;
	}

	return (
		<Pane header={[
			<VehiclesListHeader />,
			<VehiclesListFiltersBar />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={VehiclesListContext.data.filtered}
				rowIdAccessor="_id"
				selectedId={params.id}
			/>
		</Pane>
	);

	//
}
