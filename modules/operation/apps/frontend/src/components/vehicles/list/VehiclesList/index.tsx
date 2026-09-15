'use client';

import { useVehiclesDetailVehicleId } from '@/components/vehicles/detail/use-vehicles-detail-vehicle-id';
import { VehiclesListFiltersBar } from '@/components/vehicles/list/VehiclesListFiltersBar';
import { VehiclesListHeader } from '@/components/vehicles/list/VehiclesListHeader';
import { useVehiclesListContext } from '@/contexts/VehiclesList.context';
import { VehicleNormalized } from '@/types/normalized';
import { formatLicensePlate } from '@/utils/formatLicencePlate';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, keepUrlParams, LoadingOverlay, OperationalDateDisplay, Pane, Tag, useAgenciesContext } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function VehiclesList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { vehicleId } = useVehiclesDetailVehicleId();

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
			render: item => <Tag label={formatLicensePlate(item.license_plate)} />,
			title: 'Matrícula',
			width: 200,
		},
		{
			accessor: 'registration_date',
			render: item => <OperationalDateDisplay value={Number(item.registration_date) as OperationalDateInt} />,
			title: 'Data de Registo',
			width: 300,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: VehicleNormalized) => {
		router.push(keepUrlParams(PAGE_ROUTES.operation.VEHICLES_DETAIL(item._id)));
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
				selectedId={vehicleId}
			/>
		</Pane>
	);

	//
}
