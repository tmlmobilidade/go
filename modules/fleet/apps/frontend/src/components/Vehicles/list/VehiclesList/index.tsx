'use client';

/* * */

import { VehiclesListFiltersBar } from '@/components/Vehicles/list/VehiclesListFiltersBar';
import { VehiclesListHeader } from '@/components/Vehicles/list/VehiclesListHeader';
import { useVehiclesListContext } from '@/contexts/VehiclesList.context';
import { VehicleNormalized } from '@/types/normalized';
import { formatDate } from '@/utils/formatDate';
import { FormatlLicensePlate } from '@/utils/formatLicencePlate';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, LoadingOverlay, Pane, Tag, useAgenciesContext } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';

/* * */

export function VehiclesList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const vehiclesListContext = useVehiclesListContext();
	const agenciesContext = useAgenciesContext();

	const columns: DataTableColumn<VehicleNormalized>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: '#ID',
			width: 100,
		},
		{
			accessor: 'agency_id',
			render: item => <Tag label={agenciesContext.data.as_options.find(option => option.value === item.agency_id)?.label ?? ''} />,
			title: 'Operador',
			width: 350,
		},
		{
			accessor: 'license_plate',
			render: item => <Tag label={FormatlLicensePlate(item.license_plate)} />,
			title: 'matrícula do veículo',
			width: 200,
		},
		{
			accessor: 'registration_date',
			render: item => <Tag label={formatDate(item.registration_date)} />,
			title: 'Data de registo do veíuclo',
			width: 300,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: VehicleNormalized) => {
		router.push(keepUrlParams(PAGE_ROUTES.fleet.VEHICLES_DETAIL(item._id)));
	};

	//
	// C. Render components

	if (vehiclesListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (vehiclesListContext.flags.error) {
		return <ErrorDisplay message={vehiclesListContext.flags.error.message} />;
	}

	return (
		<Pane header={[
			<VehiclesListHeader key="header" />,
			<VehiclesListFiltersBar key="filters" />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={vehiclesListContext.data.filtered}
				rowIdAccessor="_id"
				selectedId={params.id}
			/>
		</Pane>
	);

	//
}
